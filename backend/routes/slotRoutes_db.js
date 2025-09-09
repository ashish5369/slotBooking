const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slotController_db');

// Slot management routes
router.get('/', slotController.getAllSlots);
router.get('/:slotId', slotController.getSlotById);
router.post('/book', slotController.bookSlot);
router.post('/add', slotController.addSlot);

// Candidate management routes (Admin)
router.get('/admin/candidates', slotController.getAllCandidates);
router.post('/admin/candidates', slotController.addCandidate);

// Export functionality
router.get('/admin/export', slotController.exportToExcel);

module.exports = router;
