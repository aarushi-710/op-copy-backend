const mongoose = require('mongoose');

// Cache to store compiled models
const modelCache = new Map();

const operatorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  station: { type: String, required: true },
  imagePath: { type: String, required: true },
});

const getOperatorModel = (line) => {
  const modelName = `Operator_${line}`;
  if (modelCache.has(modelName)) {
    return modelCache.get(modelName);
  }
  const model = mongoose.model(modelName, operatorSchema, `operators_${line}`);
  modelCache.set(modelName, model);
  return model;
};

module.exports = getOperatorModel;