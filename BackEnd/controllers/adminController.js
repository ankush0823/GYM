const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// ─── EMAIL TRANSPORTER ────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ─── HELPER: GENERATE 6-DIGIT OTP ────────────────────────────────────────────
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── CHECK IF ADMIN EXISTS ──────────────────────────────────────────────────── 
const checkAdminExists = async (req, res) => {
    try {
        const admin = await Admin.findOne();
        res.json({ exists: !!admin });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// ─── REGISTER ADMIN ─────────────────────────────────────────────────────────── 
const registerAdmin = async (req, res) => {
    try { 
        const existingAdmin = await Admin.findOne();
        if (existingAdmin) {
            return res.status(403).json({ message: 'Admin already registered. Registration is closed.' });
        }

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new Admin({ name, email, password: hashedPassword });
        await admin.save();

        res.status(201).json({ message: 'Admin registered successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// ─── LOGIN ADMIN ────────────────────────────────────────────────────────────── 
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ message: 'Invalid email or password!' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password!' });
        }

        const token = jwt.sign(
            { id: admin._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful!',
            token,
            admin: { name: admin.name, email: admin.email }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// ─── FORGOT PASSWORD: SEND OTP ──────────────────────────────────────────────── 
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) { 
            return res.status(404).json({ message: 'No admin account found with this email.' });
        }

        const otp = generateOTP();
        const expiry = new Date(Date.now() + 10 * 60 * 1000);  

        admin.resetOTP = otp;
        admin.resetOTPExpiry = expiry;
        admin.otpVerified = false;
        await admin.save();

        // SEND EMAIL
        await transporter.sendMail({
            from: `"THE ABC GYM" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset OTP - THE ABC GYM',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #111; color: #fff; padding: 30px; border-radius: 10px; border: 1px solid #222;">
                    <h2 style="color: #ff3c3c; margin-bottom: 6px;">THE TITAN GYM</h2>
                    <p style="color: #aaa; margin-bottom: 24px;">Admin Password Reset</p>
                    <p style="color: #ccc;">You requested a password reset. Use the OTP below to proceed.</p>
                    <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
                        <p style="color: #888; font-size: 13px; margin-bottom: 8px;">Your One-Time Password</p>
                        <h1 style="color: #ff3c3c; font-size: 42px; letter-spacing: 10px; margin: 0;">${otp}</h1>
                        <p style="color: #666; font-size: 12px; margin-top: 10px;">Expires in 10 minutes</p>
                    </div>
                    <p style="color: #666; font-size: 13px;">If you did not request this, please ignore this email. Your password will not change.</p>
                </div>
            `
        });

        res.json({ message: 'OTP sent to your email address.' });
    } catch (err) {
        console.error('Email send error:', err);
        res.status(500).json({ message: 'Failed to send OTP email. Please check your email configuration.', error: err.message });
    }
};

// ─── VERIFY OTP ─────────────────────────────────────────────────────────────── 
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        if (!admin.resetOTP || !admin.resetOTPExpiry) {
            return res.status(400).json({ message: 'No OTP was requested. Please start again.' });
        }

        if (new Date() > admin.resetOTPExpiry) {
            admin.resetOTP = null;
            admin.resetOTPExpiry = null;
            await admin.save();
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        if (admin.resetOTP !== otp) {
            return res.status(400).json({ message: 'Incorrect OTP. Please try again.' });
        }
 
        admin.otpVerified = true;
        await admin.save();

        res.json({ message: 'OTP verified successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// ─── RESET PASSWORD ─────────────────────────────────────────────────────────── 
const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        if (!admin.otpVerified) {
            return res.status(403).json({ message: 'OTP not verified. Please verify OTP first.' });
        }

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        admin.password = await bcrypt.hash(newPassword, 10);
        admin.resetOTP = null;
        admin.resetOTPExpiry = null;
        admin.otpVerified = false;
        await admin.save();

        res.json({ message: 'Password updated successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// ─── UPDATE ADMIN PROFILE (from dashboard) ─────────────────────────────────── 
const updateAdminProfile = async (req, res) => {
    try {
        const { name, email, newPassword } = req.body;
        const admin = await Admin.findById(req.admin.id);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        if (name) admin.name = name;
        if (email) admin.email = email;

        if (newPassword) {
            if (newPassword.length < 6) {
                return res.status(400).json({ message: 'New password must be at least 6 characters.' });
            }
            admin.password = await bcrypt.hash(newPassword, 10);
        }

        await admin.save();
        res.json({ message: 'Profile updated successfully!', admin: { name: admin.name, email: admin.email } });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// ─── DELETE ADMIN ACCOUNT ───────────────────────────────────────────────────── 
const deleteAdminAccount = async (req, res) => {
    try {
        const { password } = req.body;
        const admin = await Admin.findById(req.admin.id);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }
 
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect password. Account deletion cancelled.' });
        }

        await Admin.findByIdAndDelete(req.admin.id);
        res.json({ message: 'Admin account deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// ─── GET ADMIN PROFILE ──────────────────────────────────────────────────────── 
const getAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id).select('-password -resetOTP -resetOTPExpiry');
        if (!admin) return res.status(404).json({ message: 'Admin not found.' });
        res.json(admin);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

module.exports = {
    checkAdminExists,
    registerAdmin,
    loginAdmin,
    forgotPassword,
    verifyOTP,
    resetPassword,
    updateAdminProfile,
    deleteAdminAccount,
    getAdminProfile
};