const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
    url: { type: String, required: true },         
    publicId: { type: String, required: true },     
    caption: { type: String, default: '' },         
    order: { type: Number, default: 0 }            
}, { timestamps: true });

module.exports = mongoose.model('GalleryImage', galleryImageSchema);