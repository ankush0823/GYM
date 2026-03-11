const Member = require('../models/Member');

// GET ALL MEMBERS
const getMembers = async (req, res) => {
    try {
        const members = await Member.find().sort({ createdAt: -1 });
        res.json(members);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// ADD NEW MEMBER
const addMember = async (req, res) => {
    try {
        const { name, email, phone, plan, joinDate, expiryDate } = req.body;
        const newMember = new Member({ name, email, phone, plan, joinDate, expiryDate });
        await newMember.save();
        res.status(201).json({ message: 'Member added successfully!', newMember });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// DELETE MEMBER
const deleteMember = async (req, res) => {
    try {
        await Member.findByIdAndDelete(req.params.id);
        res.json({ message: 'Member deleted successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

module.exports = { getMembers, addMember, deleteMember };
