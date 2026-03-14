const express = require('express');
const router = express.Router();
const {
    checkAdminExists,
    registerAdmin,
    loginAdmin,
    forgotPassword,
    verifyOTP,
    resetPassword,
    updateAdminProfile,
    deleteAdminAccount,
    getAdminProfile
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
 
router.get('/check', checkAdminExists);           
router.post('/register', registerAdmin);           
router.post('/login', loginAdmin);                
router.post('/forgot-password', forgotPassword);   
router.post('/verify-otp', verifyOTP);              
router.post('/reset-password', resetPassword);      

// PROTECTED ROUTES (require JWT token)
router.get('/profile', protect, getAdminProfile);          
router.put('/profile', protect, updateAdminProfile);       
router.delete('/account', protect, deleteAdminAccount);    

module.exports = router;