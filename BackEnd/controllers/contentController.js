const Content = require('../models/Content');
const cloudinary = require('../config/cloudinary');
 
async function uploadToCloudinary(buffer, folder) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                transformation: [
                    { width: 800, height: 800, crop: 'limit' },
                    { quality: 'auto', fetch_format: 'auto' }
                ]
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(buffer);
    });
}
 
async function deleteFromCloudinary(publicId) {
    if (publicId) {
        try { await cloudinary.uploader.destroy(publicId); } catch (e) {  }
    }
}
 
const getContent = async (req, res) => {
    try {
        let content = await Content.findOne();
        if (!content) {
            content = new Content({
                hero: {
                    title: "Transform Your Body",
                    subtitle: "Transform Your Life",
                    description: "India's best gym with certified trainers and modern equipment."
                },
                plans: [
                    { name: "Basic",    price: "₹999 / month",  features: "Gym Access" },
                    { name: "Standard", price: "₹1999 / month", features: "Gym + Cardio" },
                    { name: "Premium",  price: "₹2999 / month", features: "All Access + Personal Training" }
                ],
                trainers: [
                    { name: "Trainer Name", specialty: "Strength Coach",   image: '', imagePublicId: '' },
                    { name: "Trainer Name", specialty: "Fitness Expert",    image: '', imagePublicId: '' },
                    { name: "Trainer Name", specialty: "Yoga Instructor",   image: '', imagePublicId: '' }
                ],
                programs: [
                    { name: "Weight Training",  image: '', imagePublicId: '' },
                    { name: "Cardio",            image: '', imagePublicId: '' },
                    { name: "CrossFit",          image: '', imagePublicId: '' },
                    { name: "Yoga",              image: '', imagePublicId: '' },
                    { name: "Zumba",             image: '', imagePublicId: '' },
                    { name: "Personal Training", image: '', imagePublicId: '' }
                ],
                whyUs: [
                    { title: "Certified Trainers",  description: "Professional and experienced trainers." },
                    { title: "Modern Equipment",     description: "Latest machines for best results." },
                    { title: "Flexible Timings",     description: "Workout anytime that suits you." },
                    { title: "Diet Guidance",        description: "Nutrition support for faster progress." }
                ],
                gymInfo: {
                    address: "Your Gym Address Here",
                    phone: "+91 XXXXXXXX",
                    email: "info@gym.com"
                }
            });
            await content.save();
        }
        res.json(content);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// ─── UPDATE CONTENT (admin) ───────────────────────────────────────────────────
const updateContent = async (req, res) => {
    try {
        let content = await Content.findOne();
        if (!content) {
            content = new Content(req.body);
        } else { 
            if (req.body.trainers) {
                req.body.trainers = req.body.trainers.map((incoming, i) => {
                    const existing = content.trainers[i];
                    return {
                        ...incoming,
                        image: incoming.image !== undefined ? incoming.image : (existing?.image || ''),
                        imagePublicId: incoming.imagePublicId !== undefined ? incoming.imagePublicId : (existing?.imagePublicId || '')
                    };
                });
            }
            if (req.body.programs) {
                req.body.programs = req.body.programs.map((incoming, i) => {
                    const existing = content.programs[i];
                    return {
                        ...incoming,
                        image: incoming.image !== undefined ? incoming.image : (existing?.image || ''),
                        imagePublicId: incoming.imagePublicId !== undefined ? incoming.imagePublicId : (existing?.imagePublicId || '')
                    };
                });
            }
            Object.assign(content, req.body);
        }
        await content.save();
        res.json({ message: 'Content updated successfully!', content });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// ─── UPLOAD TRAINER IMAGE ─────────────────────────────────────────────────────
const uploadTrainerImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No image provided.' });

        const index = parseInt(req.params.index);
        const content = await Content.findOne();
        if (!content || !content.trainers[index]) return res.status(404).json({ message: 'Trainer not found.' });

        await deleteFromCloudinary(content.trainers[index].imagePublicId);
        const result = await uploadToCloudinary(req.file.buffer, 'titan-gym-trainers');

        content.trainers[index].image = result.secure_url;
        content.trainers[index].imagePublicId = result.public_id;
        await content.save();

        res.json({ message: 'Trainer image uploaded!', image: result.secure_url });
    } catch (err) {
        console.error('Trainer image upload error:', err);
        res.status(500).json({ message: 'Upload failed.', error: err.message });
    }
};

// ─── REMOVE TRAINER IMAGE ─────────────────────────────────────────────────────
const removeTrainerImage = async (req, res) => {
    try {
        const index = parseInt(req.params.index);
        const content = await Content.findOne();
        if (!content || !content.trainers[index]) return res.status(404).json({ message: 'Trainer not found.' });

        await deleteFromCloudinary(content.trainers[index].imagePublicId);
        content.trainers[index].image = '';
        content.trainers[index].imagePublicId = '';
        await content.save();

        res.json({ message: 'Trainer image removed.' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// ─── UPLOAD PROGRAM IMAGE ─────────────────────────────────────────────────────
const uploadProgramImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No image provided.' });

        const index = parseInt(req.params.index);
        const content = await Content.findOne();
        if (!content || !content.programs[index]) return res.status(404).json({ message: 'Program not found.' });

        await deleteFromCloudinary(content.programs[index].imagePublicId);
        const result = await uploadToCloudinary(req.file.buffer, 'titan-gym-programs');

        content.programs[index].image = result.secure_url;
        content.programs[index].imagePublicId = result.public_id;
        await content.save();

        res.json({ message: 'Program image uploaded!', image: result.secure_url });
    } catch (err) {
        console.error('Program image upload error:', err);
        res.status(500).json({ message: 'Upload failed.', error: err.message });
    }
};

// ─── REMOVE PROGRAM IMAGE ─────────────────────────────────────────────────────
const removeProgramImage = async (req, res) => {
    try {
        const index = parseInt(req.params.index);
        const content = await Content.findOne();
        if (!content || !content.programs[index]) return res.status(404).json({ message: 'Program not found.' });

        await deleteFromCloudinary(content.programs[index].imagePublicId);
        content.programs[index].image = '';
        content.programs[index].imagePublicId = '';
        await content.save();

        res.json({ message: 'Program image removed.' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

module.exports = {
    getContent,
    updateContent,
    uploadTrainerImage,
    removeTrainerImage,
    uploadProgramImage,
    removeProgramImage
};