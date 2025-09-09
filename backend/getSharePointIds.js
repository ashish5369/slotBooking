const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');

// Replace these with your values from Azure AD
const CLIENT_ID = 'YOUR_CLIENT_ID_HERE'; // From Step 1.4
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET_HERE'; // From Step 1.6  
const TENANT_ID = 'YOUR_TENANT_ID_HERE'; // From Step 1.5

// Replace these with your SharePoint details
const SHAREPOINT_HOSTNAME = 'yourtenant.sharepoint.com'; // From Step 2.2 (e.g., contoso.sharepoint.com)
const SITE_PATH = '/sites/your-site-name'; // From Step 2.2 (e.g., /sites/hr or /sites/interview-booking)

async function getSharePointIds() {
    try {
        console.log('🔍 Getting SharePoint information...\n');

        // Initialize authentication
        const credential = new ClientSecretCredential(TENANT_ID, CLIENT_ID, CLIENT_SECRET);

        const graphClient = Client.initWithMiddleware({
            authProvider: {
                getAccessToken: async () => {
                    const tokenResponse = await credential.getToken('https://graph.microsoft.com/.default');
                    return tokenResponse.token;
                }
            }
        });

        // Get site information
        console.log(`Looking for site: ${SHAREPOINT_HOSTNAME}:${SITE_PATH}`);

        const site = await graphClient
            .api(`/sites/${SHAREPOINT_HOSTNAME}:${SITE_PATH}`)
            .get();

        console.log('✅ Site found:');
        console.log(`   Site ID: ${site.id}`);
        console.log(`   Site Name: ${site.displayName}`);
        console.log(`   Site URL: ${site.webUrl}\n`);

        // Get drives
        const drives = await graphClient
            .api(`/sites/${site.id}/drives`)
            .get();

        console.log('📁 Available drives:');
        drives.value.forEach((drive, index) => {
            console.log(`   ${index + 1}. ${drive.name} (ID: ${drive.id})`);
        });

        const defaultDrive = drives.value[0];
        console.log(`\n📂 Using default drive: ${defaultDrive.name}`);
        console.log(`   Drive ID: ${defaultDrive.id}\n`);

        // Get Excel files
        const items = await graphClient
            .api(`/drives/${defaultDrive.id}/root/children`)
            .get();

        console.log('📄 Excel files found:');
        const excelFiles = items.value.filter(item =>
            item.name.toLowerCase().endsWith('.xlsx') ||
            item.name.toLowerCase().endsWith('.xls')
        );

        if (excelFiles.length > 0) {
            excelFiles.forEach((file, index) => {
                console.log(`   ${index + 1}. ${file.name} (ID: ${file.id})`);
            });

            // Test the first Excel file
            const testFile = excelFiles[0];
            console.log(`\n🧪 Testing Excel file: ${testFile.name}`);

            const worksheets = await graphClient
                .api(`/drives/${defaultDrive.id}/items/${testFile.id}/workbook/worksheets`)
                .get();

            console.log('   Available worksheets:');
            worksheets.value.forEach((sheet, index) => {
                console.log(`   ${index + 1}. ${sheet.name}`);
            });

            console.log('\n📝 Your .env file should look like this:');
            console.log('# Microsoft Graph API Configuration');
            console.log(`CLIENT_ID=${CLIENT_ID}`);
            console.log(`CLIENT_SECRET=${CLIENT_SECRET}`);
            console.log(`TENANT_ID=${TENANT_ID}`);
            console.log('\n# SharePoint Configuration');
            console.log(`SHAREPOINT_SITE_ID=${site.id}`);
            console.log(`SHAREPOINT_DRIVE_ID=${defaultDrive.id}`);
            console.log(`EXCEL_FILE_ID=${testFile.id}`);
            console.log('WORKSHEET_NAME=Slots');
            console.log('CANDIDATES_WORKSHEET_NAME=Candidates');
            console.log('\n# Server Configuration');
            console.log('PORT=5000');

        } else {
            console.log('   No Excel files found. Please create an Excel file in your SharePoint site.');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Make sure to:');
        console.log('1. Replace YOUR_CLIENT_ID_HERE, YOUR_CLIENT_SECRET_HERE, YOUR_TENANT_ID_HERE with actual values');
        console.log('2. Replace yourtenant.sharepoint.com with your actual SharePoint domain');
        console.log('3. Replace /sites/your-site-name with your actual site path');
        console.log('4. Ensure admin consent is granted for API permissions');
    }
}

// Instructions
console.log('📋 SETUP INSTRUCTIONS:');
console.log('1. Replace YOUR_CLIENT_ID_HERE with your actual Client ID from Azure AD');
console.log('2. Replace YOUR_CLIENT_SECRET_HERE with your actual Client Secret');
console.log('3. Replace YOUR_TENANT_ID_HERE with your actual Tenant ID');
console.log('4. Replace yourtenant.sharepoint.com with your SharePoint domain');
console.log('5. Replace /sites/your-site-name with your site path');
console.log('6. Then run: node getSharePointIds.js\n');

if (CLIENT_ID === 'YOUR_CLIENT_ID_HERE') {
    console.log('⚠️  Please update the CLIENT_ID, CLIENT_SECRET, TENANT_ID, and SharePoint details first!');
} else {
    getSharePointIds();
}
