const Enquiry = require('../models/Enquiry');

// GET ALL ENQUIRIES
const getEnquiries = async (req, res) => {
    try {
        const enquiries = await Enquiry.find().sort({ createdAt: -1 });
        res.json(enquiries);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// ADD NEW ENQUIRY
const addEnquiry = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        const enquiry = new Enquiry({ name, email, phone, message });
        await enquiry.save();
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
