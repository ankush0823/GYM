const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getGallery, uploadImage, deleteImage, updateCaption } = require('../controllers/galleryController');
const { protect } = require('../middleware/authMiddleware');

// MULTER — store in memory buffer (we stream directly to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max per image
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG and WebP images are allowed.'));
        }
    }
});

router.get('/', getGallery);                                        
router.post('/', protect, upload.single('image'), uploadImage);   
router.delete('/:id', protect, deleteImage);                         
router.put('/:id/caption', protect, updateCaption);                  

module.exports = router;