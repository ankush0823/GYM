const express = require('express');
const router = express.Router();
const { getMembers, addMember, deleteMember } = require('../controllers/memberController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMembers);
router.post('/', protect, addMember);
router.delete('/:id', protect, deleteMember);

module.exports = router;
