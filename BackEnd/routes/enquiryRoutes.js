const express = require('express');
const router = express.Router();
const { getEnquiries, addEnquiry, deleteEnquiry, updateEnquiryStatus } = require('../controllers/enquiryController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getEnquiries);
router.post('/', addEnquiry);                           
router.delete('/:id', protect, deleteEnquiry);
router.put('/:id/status', protect, updateEnquiryStatus);

module.exports = router;
