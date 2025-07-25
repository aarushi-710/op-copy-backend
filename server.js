const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const operatorRoutes = require('./routes/operatorRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

const app = express();

// Connect to database
connectDB().catch((error) => {
  console.error('Failed to connect to MongoDB:', error.message);
  process.exit(1);
});

// CORS configuration for frontend
app.use(cors({ origin: 'https://op-copy-frontend.vercel.app' }));
app.use(express.json());

// MQTT client setup

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/operators', operatorRoutes);
app.use('/api/attendance', attendanceRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5090;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
