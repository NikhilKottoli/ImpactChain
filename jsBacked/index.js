const express = require('express');
const cors = require('cors');
require('dotenv').config(); 

const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const campaignRoutes = require('./routes/campaign');
const datadaoRoutes = require('./routes/datadao'); // Import the new route

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
// Routes
app.use('/posts', postRoutes);
app.use('/users', userRoutes);
app.use('/campaigns', campaignRoutes);
app.use('/api/datadao', datadaoRoutes); // Register the new route

app.get('/', (req, res) => {
  res.send('Supabase Backend Service is running! 🚀');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});