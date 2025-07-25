const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const getUserModel = require('../models/User');

exports.login = async (req, res) => {
  const { username, password, line } = req.body;
  const User = getUserModel(line);

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, line }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token, line });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};