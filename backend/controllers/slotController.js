const DatabaseService = require('../services/databaseService');

// Initialize database service
const dbService = new DatabaseService();

console.log('✅ Database service initialized');
console.log('📊 Using SQLite database for slot management');

// Get all slots
exports.getAllSlots = async (req, res) => {
  try {
    const slots = await dbService.getAllSlots();
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
    const slot = await dbService.getSlotById(req.params.slotId);

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

    // Check if candidate is approved for interview
    const isApproved = await dbService.validateCandidate(name.trim(), email.toLowerCase());
    if (!isApproved) {
      return res.status(403).json({
        message: 'Only pre-approved candidates can book interview slots. Please contact HR if you believe this is an error.'
      });
    }

    // Check if slot exists and is available
    const slot = await dbService.getSlotById(slotId);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    if (slot.status !== 'Available') {
      return res.status(400).json({ message: 'This slot is already booked' });
    }

    // Book the slot
    await dbService.bookSlot(slotId, name.trim(), email.toLowerCase());

    // Get updated slot data
    const bookedSlot = await dbService.getSlotById(slotId);

    res.status(200).json({
      message: 'Slot booked successfully',
      slot: bookedSlot
    });
  } catch (error) {
    console.error('Error booking slot:', error);

    if (error.message === 'Slot not available or not found') {
      return res.status(400).json({ message: 'This slot is no longer available' });
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
      endTime
    };

    const addedSlot = await dbService.addSlot(newSlotData);

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

// Add a new candidate (Admin functionality)
exports.addCandidate = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: 'Name and email are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Please provide a valid email address'
      });
    }

    const candidate = await dbService.addCandidate(name.trim(), email.toLowerCase());

    res.status(201).json({
      message: 'Candidate added successfully',
      candidate
    });
  } catch (error) {
    console.error('Error adding candidate:', error);

    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ message: 'Candidate with this email already exists' });
    }

    res.status(500).json({
      message: 'Error adding candidate',
      error: error.message
    });
  }
};

// Get all candidates (Admin functionality)
exports.getAllCandidates = async (req, res) => {
  try {
    const candidates = await dbService.getAllCandidates();
    res.status(200).json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({
      message: 'Error fetching candidates',
      error: error.message
    });
  }
};

// Export data to Excel
exports.exportToExcel = async (req, res) => {
  try {
    const filePath = await dbService.exportToExcel();

    res.download(filePath, `interview-data-${new Date().toISOString().split('T')[0]}.xlsx`, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ message: 'Error downloading file' });
      }
    });
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).json({
      message: 'Error exporting to Excel',
      error: error.message
    });
  }
};

// Import slots from Excel file
exports.importSlots = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await dbService.importSlots(req.file.path);

    // Clean up uploaded file
    const fs = require('fs');
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      message: 'Import completed',
      imported: result.imported,
      updated: result.updated,
      errors: result.errors
    });
  } catch (error) {
    console.error('Error importing slots:', error);
    res.status(500).json({
      message: 'Error importing slots',
      error: error.message
    });
  }
};

// Update a specific slot manually
exports.updateSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const updates = req.body;

    const result = await dbService.updateSlot(slotId, updates);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating slot:', error);
    res.status(500).json({
      message: 'Error updating slot',
      error: error.message
    });
  }
};
