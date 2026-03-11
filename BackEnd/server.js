const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// LOAD ENV VARIABLES
dotenv.config();

// CREATE EXPRESS APP
const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// ROUTES
const memberRoutes = require('./routes/memberRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const contentRoutes = require('./routes/contentRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/members', memberRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);

// TEST ROUTE
app.get('/', (req, res) => {
    res.send('Titan Gym Backend is Running!');
});

// CONNECT TO MONGODB
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('MongoDB connected successfully!');
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})
.catch((err) => {
    console.log('MongoDB connection failed!', err);
});
