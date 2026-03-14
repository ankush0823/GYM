const express = require('express');
const router = express.Router();
const { getMembers, addMember, updateMember, deleteMember, sendEnquiryNotification } = require('../controllers/memberController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMembers);
router.post('/', protect, addMember);
router.put('/:id', protect, updateMember);
router.delete('/:id', protect, deleteMember);
 
router.post('/notify-enquiry', sendEnquiryNotification);

module.exports = router;