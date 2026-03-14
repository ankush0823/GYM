const GalleryImage = require('../models/GalleryImage');
const cloudinary = require('../config/cloudinary');
 
const getGallery = async (req, res) => {
    try {
        const images = await GalleryImage.find().sort({ createdAt: -1 });
        res.json(images);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};
 
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided.' });
        }

        const { caption } = req.body;
 
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'titan-gym-gallery',
                    transformation: [
                        { width: 1200, height: 900, crop: 'limit' },
                        { quality: 'auto', fetch_format: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });

        const newImage = new GalleryImage({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            caption: caption ? caption.trim() : ''
        });

        await newImage.save();
        res.status(201).json({ message: 'Image uploaded successfully!', image: newImage });

    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ message: 'Upload failed.', error: err.message });
    }
};
 
const deleteImage = async (req, res) => {
    try {
        const image = await GalleryImage.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ message: 'Image not found.' });
        }
 
        await cloudinary.uploader.destroy(image.publicId);
 
        await GalleryImage.findByIdAndDelete(req.params.id);

        res.json({ message: 'Image deleted successfully!' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ message: 'Delete failed.', error: err.message });
    }
};

// UPDATE CAPTION 
const updateCaption = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = await GalleryImage.findByIdAndUpdate(
            req.params.id,
            { caption: caption ? caption.trim() : '' },
            { new: true }
        );
        if (!image) return res.status(404).json({ message: 'Image not found.' });
        res.json({ message: 'Caption updated!', image });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

module.exports = { getGallery, uploadImage, deleteImage, updateCaption };