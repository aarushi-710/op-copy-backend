const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const operatorRoutes = require('./routes/operatorRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const mqtt = require('mqtt');

const app = express();

// Connect to database
connectDB().catch((error) => {
  console.error('Failed to connect to MongoDB:', error.message);
  process.exit(1);
});

// CORS configuration for frontend
app.use(cors({
  origin: [
    'https://op-copy-frontend.vercel.app',
    'http://localhost:3000'  // for local development
  ],
  credentials: true
}));
app.use(express.json());

// MQTT client setup
const mqttClient = mqtt.connect('mqtt://abbc751b5b434be4ad192133b471d7bb.s1.eu.hivemq.cloud', {
  port: 8883,
  protocol: 'mqtts',
  username: 'hivemq.webclient.1748685268618',
  password: '.W9kNFm>Z8?lM35j%Ana',
  clientId: `mqttjs_backend_${Math.random().toString(16).substr(2, 8)}`,
  clean: true,
  rejectUnauthorized: false,
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
});

mqttClient.on('connect', () => {
  console.log('Connected to HiveMQ Cloud MQTT broker');
});

mqttClient.on('error', (err) => {
  console.error('MQTT connection error:', err);
});

mqttClient.on('close', () => {
  console.log('MQTT connection closed');
});

app.set('mqttClient', mqttClient);

// Routes
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