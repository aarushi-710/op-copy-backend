const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const operatorRoutes = require('./routes/operatorRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

const app = express();

// Connect to database with error handling
connectDB().catch((error) => {
  console.error('Failed to connect to MongoDB:', error.message);
  process.exit(1); // Exit if connection fails
});

app.use(cors({ origin: 'https://op-frontend-five.vercel.app' }));
app.use(express.json());
app.use('/images', express.static('public/images'));
app.use('/api/auth', authRoutes);
app.use('/api/operators', operatorRoutes);
app.use('/api/attendance', attendanceRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));