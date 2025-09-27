require('dotenv').config();
const express = require('express');
const cors = require('cors');
const photoRoutes = require('./routes/photos');
const datasetRoutes = require('./routes/datasets');
const authRoutes = require('./routes/auth'); // Import the new auth routes

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/v1/auth', authRoutes); // Add the new auth routes
app.use('/api/v1/photos', photoRoutes);
app.use('/api/v1/datasets', datasetRoutes);

// Health check endpoint
app.get('/', (req, res) => {
    res.status(200).send('Photo Pipeline API is running.');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});