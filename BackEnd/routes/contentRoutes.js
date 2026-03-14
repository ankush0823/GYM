const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    getContent,
    updateContent,
    uploadTrainerImage,
    removeTrainerImage,
    uploadProgramImage,
    removeProgramImage
} = require('../controllers/contentController');
const { protect } = require('../middleware/authMiddleware');
 
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only JPEG, PNG, WebP allowed.'));
    }
});
 
router.get('/', getContent);
 
router.put('/', protect, updateContent);
 
router.post('/trainer/:index/image', protect, upload.single('image'), uploadTrainerImage);
router.delete('/trainer/:index/image', protect, removeTrainerImage);
 
router.post('/program/:index/image', protect, upload.single('image'), uploadProgramImage);
router.delete('/program/:index/image', protect, removeProgramImage);

module.exports = router;