const express = require('express');
const router = express.Router();
const { getContent, updateContent } = require('../controllers/contentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getContent);              
router.put('/', protect, updateContent);  
module.exports = router;
