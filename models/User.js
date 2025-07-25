const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  line: { type: String, required: true },
});

const getUserModel = (line) => {
  return mongoose.model(`User_${line}`, userSchema, `users_${line}`);
};

module.exports = getUserModel;