const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
const memberRoutes = require('./routes/memberRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const contentRoutes = require('./routes/contentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

app.use('/api/members', memberRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/', (req, res) => res.send('ABC Gym Backend is Running!'));

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('MongoDB connected successfully!');
   app.listen(process.env.PORT || 10000, '0.0.0.0', () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
})
.catch((err) => console.log('MongoDB connection failed!', err));