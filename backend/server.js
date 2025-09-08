const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Import routes
const slotRoutes = require('./routes/slotRoutes');

// Use routes
app.use('/api/slots', slotRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('Interview Slot Booking API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
