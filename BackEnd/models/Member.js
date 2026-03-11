const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    plan: {
        type: String,
        enum: ['Basic', 'Standard', 'Premium'],
        required: true
    },
    joinDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);
