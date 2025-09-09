const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');
require('dotenv').config();

class SharePointExcelService {
    constructor() {
        this.credential = new ClientSecretCredential(
            process.env.TENANT_ID,
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET
        );

        this.graphClient = Client.initWithMiddleware({
            authProvider: {
                getAccessToken: async () => {
                    const tokenResponse = await this.credential.getToken('https://graph.microsoft.com/.default');
                    return tokenResponse.token;
                }
            }
        });
    }

    async getAllSlots() {
        try {
            // Read data from Excel worksheet
            const worksheetData = await this.graphClient
                .api(`/drives/${process.env.SHAREPOINT_DRIVE_ID}/items/${process.env.EXCEL_FILE_ID}/workbook/worksheets/${process.env.WORKSHEET_NAME}/usedRange`)
                .get();

            const slots = this.parseExcelData(worksheetData.values);
            return slots;
        } catch (error) {
            console.error('Error reading Excel data:', error);
            throw error;
        }
    }

    /**
     * Validate if a candidate is in the approved candidates list
     * Expected Candidates sheet columns: Name, Email, (any other columns)
     */
    async validateCandidate(name, email) {
        try {
            const candidatesSheetName = process.env.CANDIDATES_WORKSHEET_NAME || 'Candidates';

            // Read data from Candidates worksheet
            const worksheetData = await this.graphClient
                .api(`/drives/${process.env.SHAREPOINT_DRIVE_ID}/items/${process.env.EXCEL_FILE_ID}/workbook/worksheets/${candidatesSheetName}/usedRange`)
                .get();

            if (!worksheetData || !worksheetData.values || worksheetData.values.length <= 1) {
                console.log('No candidate data found in sheet');
                return false;
            }

            // Parse candidate data
            const headers = worksheetData.values[0];
            const nameColumnIndex = headers.findIndex(header =>
                header && header.toLowerCase().includes('name')
            );
            const emailColumnIndex = headers.findIndex(header =>
                header && header.toLowerCase().includes('email')
            );

            if (nameColumnIndex === -1 || emailColumnIndex === -1) {
                console.error('Name or Email column not found in candidates sheet');
                return false;
            }

            // Check if candidate exists
            for (let i = 1; i < worksheetData.values.length; i++) {
                const row = worksheetData.values[i];
                const candidateName = row[nameColumnIndex] ? row[nameColumnIndex].toString().trim().toLowerCase() : '';
                const candidateEmail = row[emailColumnIndex] ? row[emailColumnIndex].toString().trim().toLowerCase() : '';

                if (candidateName === name.trim().toLowerCase() &&
                    candidateEmail === email.trim().toLowerCase()) {
                    console.log(`✅ Candidate validated: ${name} (${email})`);
                    return true;
                }
            }

            console.log(`❌ Candidate not found in approved list: ${name} (${email})`);
            return false;
        } catch (error) {
            console.error('Error validating candidate:', error);
            // In case of error, we'll deny access for security
            return false;
        }
    }

    parseExcelData(excelValues) {
        if (!excelValues || excelValues.length <= 1) {
            return [];
        }

        // Assuming first row is headers: SlotID, Date, StartTime, EndTime, Status, BookedName, BookedEmail
        const headers = excelValues[0];
        const slots = [];

        for (let i = 1; i < excelValues.length; i++) {
            const row = excelValues[i];
            const slot = {
                slotId: row[0] || '',
                date: this.formatDate(row[1]) || '',
                startTime: row[2] || '',
                endTime: row[3] || '',
                status: row[4] || 'Available',
                bookedName: row[5] || null,
                bookedEmail: row[6] || null
            };

            // Only add slots with valid data
            if (slot.slotId && slot.date && slot.startTime && slot.endTime) {
                slots.push(slot);
            }
        }

        return slots;
    }

    formatDate(excelDate) {
        if (!excelDate) return '';

        // Handle Excel date format
        if (typeof excelDate === 'number') {
            // Excel stores dates as numbers (days since 1900-01-01)
            const date = new Date((excelDate - 25569) * 86400 * 1000);
            return date.toISOString().split('T')[0];
        }

        // If it's already a string date
        if (typeof excelDate === 'string') {
            const date = new Date(excelDate);
            return date.toISOString().split('T')[0];
        }

        return excelDate;
    }

    async updateSlotInExcel(slotId, updatedData) {
        try {
            // First, get current data to find the row
            const worksheetData = await this.graphClient
                .api(`/drives/${process.env.SHAREPOINT_DRIVE_ID}/items/${process.env.EXCEL_FILE_ID}/workbook/worksheets/${process.env.WORKSHEET_NAME}/usedRange`)
                .get();

            const excelValues = worksheetData.values;
            let rowIndex = -1;

            // Find the row with matching slotId
            for (let i = 1; i < excelValues.length; i++) {
                if (excelValues[i][0] === slotId) {
                    rowIndex = i;
                    break;
                }
            }

            if (rowIndex === -1) {
                throw new Error(`Slot with ID ${slotId} not found`);
            }

            // Update the specific row
            const updateRange = `A${rowIndex + 1}:G${rowIndex + 1}`;
            const updatedRow = [
                slotId,
                updatedData.date,
                updatedData.startTime,
                updatedData.endTime,
                updatedData.status,
                updatedData.bookedName,
                updatedData.bookedEmail
            ];

            await this.graphClient
                .api(`/drives/${process.env.SHAREPOINT_DRIVE_ID}/items/${process.env.EXCEL_FILE_ID}/workbook/worksheets/${process.env.WORKSHEET_NAME}/range(address='${updateRange}')`)
                .patch({
                    values: [updatedRow]
                });

            return true;
        } catch (error) {
            console.error('Error updating Excel data:', error);
            throw error;
        }
    }

    async getSlotById(slotId) {
        try {
            const slots = await this.getAllSlots();
            return slots.find(slot => slot.slotId === slotId);
        } catch (error) {
            console.error('Error getting slot by ID:', error);
            throw error;
        }
    }

    async bookSlot(slotId, name, email) {
        try {
            const slot = await this.getSlotById(slotId);

            if (!slot) {
                throw new Error('Slot not found');
            }

            if (slot.status !== 'Available') {
                throw new Error('Slot is already booked');
            }

            const updatedSlotData = {
                ...slot,
                status: 'Booked',
                bookedName: name,
                bookedEmail: email
            };

            await this.updateSlotInExcel(slotId, updatedSlotData);
            return updatedSlotData;
        } catch (error) {
            console.error('Error booking slot:', error);
            throw error;
        }
    }

    async addNewSlot(slotData) {
        try {
            // Get current data to find the next empty row
            const worksheetData = await this.graphClient
                .api(`/drives/${process.env.SHAREPOINT_DRIVE_ID}/items/${process.env.EXCEL_FILE_ID}/workbook/worksheets/${process.env.WORKSHEET_NAME}/usedRange`)
                .get();

            const nextRow = worksheetData.values.length + 1;
            const newRange = `A${nextRow}:G${nextRow}`;

            const newSlotRow = [
                slotData.slotId,
                slotData.date,
                slotData.startTime,
                slotData.endTime,
                slotData.status || 'Available',
                slotData.bookedName || null,
                slotData.bookedEmail || null
            ];

            await this.graphClient
                .api(`/drives/${process.env.SHAREPOINT_DRIVE_ID}/items/${process.env.EXCEL_FILE_ID}/workbook/worksheets/${process.env.WORKSHEET_NAME}/range(address='${newRange}')`)
                .patch({
                    values: [newSlotRow]
                });

            return slotData;
        } catch (error) {
            console.error('Error adding new slot:', error);
            throw error;
        }
    }
}

module.exports = SharePointExcelService;
