const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    hero: {
        title: { type: String },
        subtitle: { type: String },
        description: { type: String }
    },
    plans: [{
        name: { type: String },
        price: { type: String },
        features: { type: String }
    }],
    trainers: [{
        name: { type: String },
        specialty: { type: String },
        image: { type: String, default: '' },           
        imagePublicId: { type: String, default: '' }    
    }],
    programs: [{
        name: { type: String },
        image: { type: String, default: '' },          
        imagePublicId: { type: String, default: '' }    
    }],
    whyUs: [{
        title: { type: String },
        description: { type: String }
    }],
    gymInfo: {
        address: { type: String },
        phone: { type: String },
        email: { type: String }
    }
}, { timestamps: true });

module.exports = mongoose.model('Content', contentSchema);