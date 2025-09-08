const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slotController');

// Get all available slots
router.get('/', slotController.getAllSlots);

// Get a specific slot by ID
router.get('/:slotId', slotController.getSlotById);

// Book a slot
router.post('/book', slotController.bookSlot);

module.exports = router;
