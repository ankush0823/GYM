const Review = require('../models/Review');

// GET APPROVED REVIEWS (public - shown on website)
const getApprovedReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ approved: true }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// GET ALL REVIEWS (admin only - includes pending)
const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// SUBMIT NEW REVIEW (public)
const addReview = async (req, res) => {
    try {
        const { name, rating, message } = req.body;

        if (!name || !rating || !message) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }

        const review = new Review({ name, rating, message });
        await review.save();

        res.status(201).json({ message: 'Review submitted! It will appear after admin approval.' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// APPROVE REVIEW (admin only)
const approveReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { approved: true },
            { new: true }
        );
        if (!review) return res.status(404).json({ message: 'Review not found.' });
        res.json({ message: 'Review approved!', review });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// DELETE REVIEW (admin only)
const deleteReview = async (req, res) => {
    try {
        await Review.findByIdAndDelete(req.params.id);
        res.json({ message: 'Review deleted successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

module.exports = { getApprovedReviews, getAllReviews, addReview, approveReview, deleteReview };