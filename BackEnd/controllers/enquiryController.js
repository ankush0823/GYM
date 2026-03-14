const Enquiry = require('../models/Enquiry');
const nodemailer = require('nodemailer');

// EMAIL TRANSPORTER
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// GET ALL ENQUIRIES
const getEnquiries = async (req, res) => {
    try {
        const enquiries = await Enquiry.find().sort({ createdAt: -1 });
        res.json(enquiries);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};
 
const addEnquiry = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        const enquiry = new Enquiry({ name, email, phone, message });
        await enquiry.save();
 
        transporter.sendMail({
            from: `"THE ABC GYM Website" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `📬 New Enquiry from ${name} - THE ABC GYM`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #111; color: #fff; padding: 30px; border-radius: 10px; border: 1px solid #222;">
                    <h2 style="color: #ff3c3c; margin-bottom: 4px;">THE TITAN GYM</h2>
                    <p style="color: #888; margin-bottom: 24px; font-size: 13px;">New Enquiry Notification</p>

                    <div style="background: #1a1a1a; border-radius: 8px; padding: 20px; border: 1px solid #2a2a2a; margin-bottom: 16px;">
                        <table style="width:100%; border-collapse:collapse;">
                            <tr>
                                <td style="color:#888; font-size:13px; padding: 8px 0; width:100px;">Name</td>
                                <td style="color:#fff; font-size:14px; font-weight:600;">${name}</td>
                            </tr>
                            <tr>
                                <td style="color:#888; font-size:13px; padding: 8px 0;">Email</td>
                                <td style="color:#fff; font-size:14px;">${email}</td>
                            </tr>
                            <tr>
                                <td style="color:#888; font-size:13px; padding: 8px 0;">Phone</td>
                                <td style="color:#fff; font-size:14px;">${phone}</td>
                            </tr>
                        </table>
                    </div>

                    <div style="background: #1a1a1a; border-radius: 8px; padding: 20px; border: 1px solid #2a2a2a;">
                        <p style="color:#888; font-size:13px; margin-bottom:8px;">Message</p>
                        <p style="color:#fff; font-size:14px; line-height:1.6; margin:0;">${message}</p>
                    </div>

                    <p style="color:#555; font-size:12px; margin-top:20px; text-align:center;">
                        Login to your admin dashboard to manage this enquiry.
                    </p>
                </div>
            `
        }).catch(err => console.error('Admin notification email failed:', err));

        res.status(201).json({ message: 'Enquiry submitted successfully!', enquiry });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// DELETE ENQUIRY
const deleteEnquiry = async (req, res) => {
    try {
        await Enquiry.findByIdAndDelete(req.params.id);
        res.json({ message: 'Enquiry deleted successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// UPDATE ENQUIRY STATUS
const updateEnquiryStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const enquiry = await Enquiry.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json({ message: 'Status updated successfully!', enquiry });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

module.exports = { getEnquiries, addEnquiry, deleteEnquiry, updateEnquiryStatus };