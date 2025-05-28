const mongoose = require('mongoose');

// Cache to store compiled models
const modelCache = new Map();

const getAttendanceSchema = (line) => {
  return new mongoose.Schema({
    operatorId: { type: mongoose.Schema.Types.ObjectId, ref: `Operator_${line}`, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    timestamp: { type: String, required: true }, // ISO 8601 timestamp, e.g., "2025-05-27T09:59:00.000Z"
    status: { type: String, enum: ['Present', 'Absent'], default: 'Present' },
  });
};

const getAttendanceModel = (line) => {
  const modelName = `Attendance_${line}`;
  if (modelCache.has(modelName)) {
    return modelCache.get(modelName);
  }
  const model = mongoose.model(modelName, getAttendanceSchema(line), `attendance_${line}`);
  modelCache.set(modelName, model);
  return model;
};

module.exports = getAttendanceModel;