const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');

class DatabaseService {
    constructor() {
        this.dbPath = path.join(__dirname, '../database.sqlite');
        this.db = new sqlite3.Database(this.dbPath);
        this.initializeTables();
    }

    // Initialize database tables
    initializeTables() {
        // Slots table
        this.db.run(`
      CREATE TABLE IF NOT EXISTS slots (
        slotId TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        status TEXT DEFAULT 'Available',
        bookedName TEXT,
        bookedEmail TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Candidates table (approved candidates)
        this.db.run(`
      CREATE TABLE IF NOT EXISTS candidates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Insert sample data if tables are empty
        this.insertSampleData();
    }

    // Insert sample data
    insertSampleData() {
        // Sample slots
        const sampleSlots = [
            { slotId: 'slot-001', date: '2025-09-09', startTime: '09:00', endTime: '10:00' },
            { slotId: 'slot-002', date: '2025-09-09', startTime: '11:00', endTime: '12:00' },
            { slotId: 'slot-003', date: '2025-09-10', startTime: '09:00', endTime: '10:00' },
            { slotId: 'slot-004', date: '2025-09-10', startTime: '11:00', endTime: '12:00' },
            { slotId: 'slot-005', date: '2025-09-11', startTime: '09:00', endTime: '10:00' },
            { slotId: 'slot-006', date: '2025-09-11', startTime: '14:00', endTime: '15:00' }
        ];

        // Sample candidates (approved for interviews)
        const sampleCandidates = [
            { name: 'John Doe', email: 'john.doe@example.com' },
            { name: 'Jane Smith', email: 'jane.smith@example.com' },
            { name: 'Ashish Singh', email: 'ashish.singh282002@gmail.com' },
            { name: 'Test User', email: 'test@example.com' },
            { name: 'Demo Candidate', email: 'demo@company.com' }
        ];

        // Insert slots if table is empty
        this.db.get("SELECT COUNT(*) as count FROM slots", (err, row) => {
            if (!err && row.count === 0) {
                console.log('📅 Inserting sample slots...');
                sampleSlots.forEach(slot => {
                    this.db.run(`
            INSERT INTO slots (slotId, date, startTime, endTime, status)
            VALUES (?, ?, ?, ?, 'Available')
          `, [slot.slotId, slot.date, slot.startTime, slot.endTime]);
                });
            }
        });

        // Insert candidates if table is empty
        this.db.get("SELECT COUNT(*) as count FROM candidates", (err, row) => {
            if (!err && row.count === 0) {
                console.log('👥 Inserting sample candidates...');
                sampleCandidates.forEach(candidate => {
                    this.db.run(`
            INSERT OR IGNORE INTO candidates (name, email)
            VALUES (?, ?)
          `, [candidate.name, candidate.email]);
                });
            }
        });
    }

    // Get all slots
    getAllSlots() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM slots ORDER BY date, startTime", (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Get slot by ID
    getSlotById(slotId) {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM slots WHERE slotId = ?", [slotId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // Check if candidate is approved
    validateCandidate(name, email) {
        return new Promise((resolve, reject) => {
            this.db.get(`
        SELECT * FROM candidates 
        WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) 
        AND LOWER(TRIM(email)) = LOWER(TRIM(?))
      `, [name, email], (err, row) => {
                if (err) reject(err);
                else resolve(!!row); // Return true if candidate found
            });
        });
    }

    // Book a slot
    bookSlot(slotId, name, email) {
        return new Promise((resolve, reject) => {
            this.db.run(`
        UPDATE slots 
        SET status = 'Booked', bookedName = ?, bookedEmail = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE slotId = ? AND status = 'Available'
      `, [name, email, slotId], function (err) {
                if (err) reject(err);
                else if (this.changes === 0) reject(new Error('Slot not available or not found'));
                else resolve(true);
            });
        });
    }

    // Add new slot
    addSlot(slotData) {
        return new Promise((resolve, reject) => {
            this.db.run(`
        INSERT INTO slots (slotId, date, startTime, endTime, status)
        VALUES (?, ?, ?, ?, 'Available')
      `, [slotData.slotId, slotData.date, slotData.startTime, slotData.endTime], function (err) {
                if (err) reject(err);
                else resolve({ ...slotData, status: 'Available' });
            });
        });
    }

    // Add new candidate
    addCandidate(name, email) {
        return new Promise((resolve, reject) => {
            this.db.run(`
        INSERT INTO candidates (name, email)
        VALUES (?, ?)
      `, [name, email], function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, name, email });
            });
        });
    }

    // Get all candidates
    getAllCandidates() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM candidates ORDER BY name", (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Export to Excel
    async exportToExcel(filePath = null) {
        try {
            const slots = await this.getAllSlots();
            const candidates = await this.getAllCandidates();

            // Create workbook
            const workbook = XLSX.utils.book_new();

            // Slots worksheet
            const slotsWS = XLSX.utils.json_to_sheet(slots.map(slot => ({
                SlotID: slot.slotId,
                Date: slot.date,
                StartTime: slot.startTime,
                EndTime: slot.endTime,
                Status: slot.status,
                BookedName: slot.bookedName || '',
                BookedEmail: slot.bookedEmail || ''
            })));

            // Candidates worksheet
            const candidatesWS = XLSX.utils.json_to_sheet(candidates.map(candidate => ({
                Name: candidate.name,
                Email: candidate.email
            })));

            // Add worksheets to workbook
            XLSX.utils.book_append_sheet(workbook, slotsWS, 'Slots');
            XLSX.utils.book_append_sheet(workbook, candidatesWS, 'Candidates');

            // Generate file path
            const exportPath = filePath || path.join(__dirname, '../exports', `interview-data-${new Date().toISOString().split('T')[0]}.xlsx`);

            // Ensure exports directory exists
            const exportDir = path.dirname(exportPath);
            if (!fs.existsSync(exportDir)) {
                fs.mkdirSync(exportDir, { recursive: true });
            }

            // Write file
            XLSX.writeFile(workbook, exportPath);

            console.log(`📊 Excel file exported to: ${exportPath}`);
            return exportPath;
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            throw error;
        }
    }

    // Import candidates from Excel/CSV
    importCandidates(filePath) {
        return new Promise((resolve, reject) => {
            try {
                const workbook = XLSX.readFile(filePath);
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(worksheet);

                let imported = 0;
                let errors = [];

                data.forEach((row, index) => {
                    const name = row.Name || row.name;
                    const email = row.Email || row.email;

                    if (name && email) {
                        this.db.run(`
              INSERT OR IGNORE INTO candidates (name, email)
              VALUES (?, ?)
            `, [name.trim(), email.trim()], function (err) {
                            if (!err && this.changes > 0) {
                                imported++;
                            }
                        });
                    } else {
                        errors.push(`Row ${index + 1}: Missing name or email`);
                    }
                });

                resolve({ imported, errors });
            } catch (error) {
                reject(error);
            }
        });
    }

    // Import slots from Excel file
    importSlots(filePath) {
        return new Promise((resolve, reject) => {
            try {
                const workbook = XLSX.readFile(filePath);
                let sheetName = 'Slots';

                // Try to find Slots sheet, otherwise use first sheet
                if (!workbook.SheetNames.includes(sheetName)) {
                    sheetName = workbook.SheetNames[0];
                }

                const worksheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(worksheet);

                let imported = 0;
                let updated = 0;
                let errors = [];

                data.forEach((row, index) => {
                    const slotId = row.SlotID || row.slotId || row['Slot ID'];
                    const date = row.Date || row.date;
                    const startTime = row.StartTime || row.startTime || row['Start Time'];
                    const endTime = row.EndTime || row.endTime || row['End Time'];
                    const status = row.Status || row.status || 'Available';
                    const bookedName = row.BookedName || row.bookedName || row['Booked Name'] || null;
                    const bookedEmail = row.BookedEmail || row.bookedEmail || row['Booked Email'] || null;

                    if (!date || !startTime || !endTime) {
                        errors.push(`Row ${index + 2}: Missing required fields (date, startTime, endTime)`);
                        return;
                    }

                    // Format date to YYYY-MM-DD if needed
                    let formattedDate = date;
                    if (date instanceof Date) {
                        formattedDate = date.toISOString().split('T')[0];
                    } else if (typeof date === 'string') {
                        // Try to parse different date formats
                        const parsedDate = new Date(date);
                        if (!isNaN(parsedDate)) {
                            formattedDate = parsedDate.toISOString().split('T')[0];
                        }
                    }

                    if (slotId) {
                        // Update existing slot
                        this.db.run(`
                            UPDATE slots 
                            SET date = ?, startTime = ?, endTime = ?, status = ?, 
                                bookedName = ?, bookedEmail = ?, updatedAt = datetime('now')
                            WHERE slotId = ?
                        `, [formattedDate, startTime, endTime, status, bookedName, bookedEmail, slotId],
                            function (err) {
                                if (err) {
                                    errors.push(`Row ${index + 2}: ${err.message}`);
                                } else if (this.changes > 0) {
                                    updated++;
                                } else {
                                    errors.push(`Row ${index + 2}: Slot ID ${slotId} not found`);
                                }
                            });
                    } else {
                        // Create new slot
                        const newSlotId = `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                        this.db.run(`
                            INSERT INTO slots (slotId, date, startTime, endTime, status, bookedName, bookedEmail)
                            VALUES (?, ?, ?, ?, ?, ?, ?)
                        `, [newSlotId, formattedDate, startTime, endTime, status, bookedName, bookedEmail],
                            function (err) {
                                if (err) {
                                    errors.push(`Row ${index + 2}: ${err.message}`);
                                } else {
                                    imported++;
                                }
                            });
                    }
                });

                // Wait a bit for all database operations to complete
                setTimeout(() => {
                    resolve({ imported, updated, errors });
                }, 1000);

            } catch (error) {
                reject(error);
            }
        });
    }

    // Update a specific slot manually
    updateSlot(slotId, updates) {
        return new Promise((resolve, reject) => {
            const allowedFields = ['date', 'startTime', 'endTime', 'status', 'bookedName', 'bookedEmail'];
            const updateFields = [];
            const values = [];

            // Build dynamic update query
            Object.keys(updates).forEach(field => {
                if (allowedFields.includes(field) && updates[field] !== undefined) {
                    updateFields.push(`${field} = ?`);
                    values.push(updates[field]);
                }
            });

            if (updateFields.length === 0) {
                return reject(new Error('No valid fields to update'));
            }

            updateFields.push('updatedAt = datetime(\'now\')');
            values.push(slotId);

            const query = `UPDATE slots SET ${updateFields.join(', ')} WHERE slotId = ?`;

            this.db.run(query, values, function (err) {
                if (err) {
                    reject(err);
                } else if (this.changes === 0) {
                    reject(new Error('Slot not found'));
                } else {
                    resolve({ message: 'Slot updated successfully', changes: this.changes });
                }
            });
        });
    }

    // Close database connection
    close() {
        this.db.close();
    }
}

module.exports = DatabaseService;
