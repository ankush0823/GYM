const express = require('express');
const router = express.Router();
const {
    getApprovedReviews,
    getAllReviews,
    addReview,
    approveReview,
    deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getApprovedReviews);
router.post('/', addReview);                            
router.get('/all', protect, getAllReviews);              
router.put('/:id/approve', protect, approveReview);     
router.delete('/:id', protect, deleteReview);           

module.exports = router;