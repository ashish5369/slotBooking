const fs = require('fs');
const path = require('path');

const slotsFilePath = path.join(__dirname, '../slots.json');

// Helper function to read slots from JSON file
const readSlotsFile = () => {
  try {
    const data = fs.readFileSync(slotsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading slots file:', error);
    return [];
  }
};

// Helper function to write slots to JSON file
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
exports.getAllSlots = (req, res) => {
  try {
    const slots = readSlotsFile();
    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching slots', error: error.message });
  }
};

// Get a slot by ID
exports.getSlotById = (req, res) => {
  try {
    const slots = readSlotsFile();
    const slot = slots.find(slot => slot.slotId === req.params.slotId);
    
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }
    
    res.status(200).json(slot);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching slot', error: error.message });
  }
};

// Book a slot
exports.bookSlot = (req, res) => {
  try {
    const { slotId, name, email } = req.body;
    
    if (!slotId || !name || !email) {
      return res.status(400).json({ message: 'SlotID, name, and email are required' });
    }
    
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
    slots[slotIndex].bookedName = name;
    slots[slotIndex].bookedEmail = email;
    
    // Write updated slots back to file
    if (writeSlotsFile(slots)) {
      res.status(200).json({ 
        message: 'Slot booked successfully', 
        slot: slots[slotIndex] 
      });
    } else {
      res.status(500).json({ message: 'Error saving booking information' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error booking slot', error: error.message });
  }
};
