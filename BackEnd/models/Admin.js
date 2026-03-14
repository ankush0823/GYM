const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // FOR FORGOT PASSWORD OTP
    resetOTP: { type: String, default: null },
    resetOTPExpiry: { type: Date, default: null },
    otpVerified: { type: Boolean, default: false }

}, { timestamps: true });

// COMPARE PASSWORD
adminSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);