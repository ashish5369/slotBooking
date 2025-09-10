const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const slotController = require('../controllers/slotController');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, 'import-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['.xlsx', '.xls', '.csv'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel and CSV files are allowed'));
        }
    }
});

// Slot management routes
router.get('/', slotController.getAllSlots);
router.get('/:slotId', slotController.getSlotById);
router.post('/book', slotController.bookSlot);
router.post('/add', slotController.addSlot);
router.put('/:slotId', slotController.updateSlot);
router.delete('/:slotId', slotController.deleteSlot);

// Candidate management routes (Admin)
router.get('/admin/candidates', slotController.getAllCandidates);
router.post('/admin/candidates', slotController.addCandidate);
router.put('/admin/candidates/:candidateId', slotController.updateCandidate);
router.delete('/admin/candidates/:candidateId', slotController.deleteCandidate);

// Import/Export functionality
router.get('/admin/export', slotController.exportToExcel);
router.post('/admin/import', upload.single('excelFile'), slotController.importSlots);

module.exports = router;
