const { Client } = require('@microsoft/microsoft-graph-client');
const { ConfidentialClientApplication } = require('@azure/msal-node');
require('dotenv').config();

class SharePointSetupHelper {
    constructor() {
        this.clientApp = new ConfidentialClientApplication({
            auth: {
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`
            }
        });
    }

    async authenticate() {
        try {
            const clientCredentialRequest = {
                scopes: ['https://graph.microsoft.com/.default'],
            };

            const response = await this.clientApp.acquireTokenByClientCredential(clientCredentialRequest);

            this.graphClient = Client.init({
                authProvider: (done) => {
                    done(null, response.accessToken);
                }
            });

            console.log('✅ Authentication successful!');
            return true;
        } catch (error) {
            console.error('❌ Authentication failed:', error.message);
            return false;
        }
    }

    async getSiteId(hostname, sitePath) {
        try {
            const site = await this.graphClient
                .api(`/sites/${hostname}:${sitePath}`)
                .get();

            console.log('📍 Site ID:', site.id);
            return site.id;
        } catch (error) {
            console.error('❌ Error getting site ID:', error.message);
            return null;
        }
    }

    async getDrives(siteId) {
        try {
            const drives = await this.graphClient
                .api(`/sites/${siteId}/drives`)
                .get();

            console.log('💾 Available drives:');
            drives.value.forEach(drive => {
                console.log(`  - ${drive.name} (ID: ${drive.id})`);
            });

            return drives.value;
        } catch (error) {
            console.error('❌ Error getting drives:', error.message);
            return [];
        }
    }

    async getFiles(driveId, folderPath = 'root') {
        try {
            const files = await this.graphClient
                .api(`/drives/${driveId}/${folderPath}/children`)
                .get();

            console.log('📁 Files in drive:');
            files.value.forEach(file => {
                console.log(`  - ${file.name} (ID: ${file.id}) [${file.file ? 'File' : 'Folder'}]`);
            });

            return files.value;
        } catch (error) {
            console.error('❌ Error getting files:', error.message);
            return [];
        }
    }

    async searchExcelFiles(driveId, filename) {
        try {
            const searchResults = await this.graphClient
                .api(`/drives/${driveId}/root/search(q='${filename}')`)
                .get();

            console.log(`🔍 Search results for "${filename}":`);
            searchResults.value.forEach(file => {
                console.log(`  - ${file.name} (ID: ${file.id})`);
            });

            return searchResults.value;
        } catch (error) {
            console.error('❌ Error searching files:', error.message);
            return [];
        }
    }

    async testExcelAccess(driveId, fileId, worksheetName = 'Sheet1') {
        try {
            const worksheetData = await this.graphClient
                .api(`/drives/${driveId}/items/${fileId}/workbook/worksheets/${worksheetName}/usedRange`)
                .get();

            console.log('📊 Excel file access successful!');
            console.log('Data preview:');
            console.log(worksheetData.values);

            return true;
        } catch (error) {
            console.error('❌ Error accessing Excel file:', error.message);
            return false;
        }
    }
}

// Main setup function
async function runSetup() {
    console.log('🚀 Starting SharePoint setup helper...\n');

    // Check environment variables
    const requiredVars = ['CLIENT_ID', 'CLIENT_SECRET', 'TENANT_ID'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:', missingVars.join(', '));
        console.log('Please update your .env file with the required values.');
        return;
    }

    const helper = new SharePointSetupHelper();

    // Step 1: Authenticate
    console.log('Step 1: Authenticating with Microsoft Graph...');
    const authenticated = await helper.authenticate();
    if (!authenticated) return;

    console.log('\n' + '='.repeat(50) + '\n');

    // You can customize these values or make them interactive
    const hostname = 'yourdomain.sharepoint.com'; // Replace with your SharePoint hostname
    const sitePath = '/sites/yoursite'; // Replace with your site path

    // Step 2: Get Site ID
    console.log('Step 2: Getting Site ID...');
    console.log(`Looking for site: ${hostname}${sitePath}`);
    const siteId = await helper.getSiteId(hostname, sitePath);
    if (!siteId) return;

    console.log('\n' + '='.repeat(50) + '\n');

    // Step 3: Get Drives
    console.log('Step 3: Getting available drives...');
    const drives = await helper.getDrives(siteId);
    if (drives.length === 0) return;

    // Use the first drive (usually Documents)
    const driveId = drives[0].id;
    console.log(`Using drive: ${drives[0].name} (${driveId})`);

    console.log('\n' + '='.repeat(50) + '\n');

    // Step 4: Search for Excel files
    console.log('Step 4: Searching for Excel files...');
    await helper.searchExcelFiles(driveId, '.xlsx');

    console.log('\n' + '='.repeat(50) + '\n');

    // Step 5: List all files in root
    console.log('Step 5: Listing files in drive root...');
    await helper.getFiles(driveId);

    console.log('\n' + '='.repeat(50) + '\n');

    // Step 6: Test Excel access (you'll need to update with actual file ID)
    console.log('Step 6: Testing Excel file access...');
    console.log('To test Excel access, update the fileId below with your actual Excel file ID');
    // Uncomment and update this line with your actual file ID:
    // await helper.testExcelAccess(driveId, 'YOUR_EXCEL_FILE_ID', 'Sheet1');

    console.log('\n🎉 Setup complete! Use the IDs above to update your .env file.');
    console.log('\nExample .env configuration:');
    console.log(`SHAREPOINT_SITE_ID=${siteId}`);
    console.log(`SHAREPOINT_DRIVE_ID=${driveId}`);
    console.log('EXCEL_FILE_ID=your_excel_file_id_from_search_results');
    console.log('WORKSHEET_NAME=Sheet1');
}

// Run the setup if this file is executed directly
if (require.main === module) {
    runSetup().catch(console.error);
}

module.exports = SharePointSetupHelper;
