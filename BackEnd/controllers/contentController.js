const Content = require('../models/Content');

// GET CONTENT
const getContent = async (req, res) => {
    try {
        let content = await Content.findOne();
        if (!content) {
            // CREATE DEFAULT CONTENT IF NONE EXISTS
            content = new Content({
                hero: {
                    title: "Transform Your Body",
                    subtitle: "Transform Your Life",
                    description: "India's best gym with certified trainers and modern equipment."
                },
                plans: [
                    { name: "Basic", price: "₹999 / month", features: "Gym Access" },
                    { name: "Standard", price: "₹1999 / month", features: "Gym + Cardio" },
                    { name: "Premium", price: "₹2999 / month", features: "All Access + Personal Training" }
                ],
                trainers: [
                    { name: "Trainer Name", specialty: "Strength Coach" },
                    { name: "Trainer Name", specialty: "Fitness Expert" },
                    { name: "Trainer Name", specialty: "Yoga Instructor" }
                ],
                programs: [
                    { name: "Weight Training" },
                    { name: "Cardio" },
                    { name: "CrossFit" },
                    { name: "Yoga" },
                    { name: "Zumba" },
                    { name: "Personal Training" }
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

// UPDATE CONTENT
const updateContent = async (req, res) => {
    try {
        let content = await Content.findOne();
        if (!content) {
            content = new Content(req.body);
        } else {
            Object.assign(content, req.body);
        }
        await content.save();
        res.json({ message: 'Content updated successfully!', content });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

module.exports = { getContent, updateContent };
