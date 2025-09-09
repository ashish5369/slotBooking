const SharePointExcelService = require('../services/sharepointService');
const fs = require('fs');
const path = require('path');

// Initialize services
let sharepointService = null;
let useSharePoint = false;

// Check if SharePoint is configured
const isSharePointConfigured = () => {
    return process.env.CLIENT_ID &&
        process.env.CLIENT_SECRET &&
        process.env.TENANT_ID &&
        process.env.CLIENT_ID !== 'your_client_id_here' &&
        process.env.CLIENT_SECRET !== 'your_client_secret_here' &&
        process.env.TENANT_ID !== 'your_tenant_id_here';
};

// Initialize SharePoint service if configured
if (isSharePointConfigured()) {
    try {
        sharepointService = new SharePointExcelService();
        useSharePoint = true;
        console.log('✅ SharePoint Excel integration enabled');
    } catch (error) {
        console.error('❌ SharePoint initialization failed:', error.message);
        console.log('🔄 Falling back to local JSON file');
    }
} else {
    console.log('📝 SharePoint not configured, using local JSON file');
    console.log('💡 To enable SharePoint integration, update your .env file with valid credentials');
}

// Fallback JSON file operations
const slotsFilePath = path.join(__dirname, '../slots.json');

const readSlotsFile = () => {
    try {
        const data = fs.readFileSync(slotsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading slots file:', error);
        return [];
    }
};

const writeSlotsFile = (slots) => {
    try {
        fs.writeFileSync(slotsFilePath, JSON.stringify(slots, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing slots file:', error);
        return false;
    }
};

// Get all slots
exports.getAllSlots = async (req, res) => {
    try {
        let slots;

        if (useSharePoint && sharepointService) {
            slots = await sharepointService.getAllSlots();
        } else {
            slots = readSlotsFile();
        }

        res.status(200).json(slots);
    } catch (error) {
        console.error('Error fetching slots:', error);
        res.status(500).json({
            message: 'Error fetching slots',
            error: error.message
        });
    }
};

// Get a slot by ID
exports.getSlotById = async (req, res) => {
    try {
        let slot;

        if (useSharePoint && sharepointService) {
            slot = await sharepointService.getSlotById(req.params.slotId);
        } else {
            const slots = readSlotsFile();
            slot = slots.find(slot => slot.slotId === req.params.slotId);
        }

        if (!slot) {
            return res.status(404).json({ message: 'Slot not found' });
        }

        res.status(200).json(slot);
    } catch (error) {
        console.error('Error fetching slot:', error);
        res.status(500).json({
            message: 'Error fetching slot',
            error: error.message
        });
    }
};

// Book a slot
exports.bookSlot = async (req, res) => {
    try {
        const { slotId, name, email } = req.body;

        // Input validation
        if (!slotId || !name || !email) {
            return res.status(400).json({
                message: 'SlotID, name, and email are required'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: 'Please provide a valid email address'
            });
        }

        // Name validation
        if (name.trim().length < 2) {
            return res.status(400).json({
                message: 'Name must be at least 2 characters long'
            });
        }

        let bookedSlot;

        if (useSharePoint && sharepointService) {
            bookedSlot = await sharepointService.bookSlot(slotId, name.trim(), email.toLowerCase());
        } else {
            // Local JSON file booking logic
            const slots = readSlotsFile();
            const slotIndex = slots.findIndex(slot => slot.slotId === slotId);

            if (slotIndex === -1) {
                return res.status(404).json({ message: 'Slot not found' });
            }

            if (slots[slotIndex].status !== 'Available') {
                return res.status(400).json({ message: 'This slot is already booked' });
            }

            // Update the slot
            slots[slotIndex].status = 'Booked';
            slots[slotIndex].bookedName = name.trim();
            slots[slotIndex].bookedEmail = email.toLowerCase();

            // Write updated slots back to file
            if (writeSlotsFile(slots)) {
                bookedSlot = slots[slotIndex];
            } else {
                return res.status(500).json({ message: 'Error saving booking information' });
            }
        }

        res.status(200).json({
            message: 'Slot booked successfully',
            slot: bookedSlot
        });
    } catch (error) {
        console.error('Error booking slot:', error);

        if (error.message === 'Slot not found') {
            return res.status(404).json({ message: 'Slot not found' });
        }

        if (error.message === 'Slot is already booked') {
            return res.status(400).json({ message: 'This slot is already booked' });
        }

        res.status(500).json({
            message: 'Error booking slot',
            error: error.message
        });
    }
};

// Add a new slot (Admin functionality)
exports.addSlot = async (req, res) => {
    try {
        const { date, startTime, endTime, slotId } = req.body;

        // Input validation
        if (!date || !startTime || !endTime) {
            return res.status(400).json({
                message: 'Date, start time, and end time are required'
            });
        }

        // Generate slotId if not provided
        const finalSlotId = slotId || `slot-${Date.now()}`;

        const newSlotData = {
            slotId: finalSlotId,
            date,
            startTime,
            endTime,
            status: 'Available',
            bookedName: null,
            bookedEmail: null
        };

        let addedSlot;

        if (useSharePoint && sharepointService) {
            addedSlot = await sharepointService.addNewSlot(newSlotData);
        } else {
            // Local JSON file add logic
            const slots = readSlotsFile();

            // Check if slot ID already exists
            if (slots.find(slot => slot.slotId === finalSlotId)) {
                return res.status(400).json({ message: 'Slot ID already exists' });
            }

            slots.push(newSlotData);

            if (writeSlotsFile(slots)) {
                addedSlot = newSlotData;
            } else {
                return res.status(500).json({ message: 'Error saving new slot' });
            }
        }

        res.status(201).json({
            message: 'Slot added successfully',
            slot: addedSlot
        });
    } catch (error) {
        console.error('Error adding slot:', error);
        res.status(500).json({
            message: 'Error adding slot',
            error: error.message
        });
    }
};
