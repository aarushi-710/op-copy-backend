// controllers/operatorController.js
const getOperatorModel = require('../models/Operator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure images directory exists
const imageDir = path.join(__dirname, '../public/images');
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'operator-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage }).single('file');

exports.getOperators = async (req, res) => {
  const { line } = req.params;
  const Operator = getOperatorModel(line);
  try {
    const operators = await Operator.find();
    res.status(200).json(operators || []);
  } catch (error) {
    console.error('Error fetching operators:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addOperator = async (req, res) => {
  const { line } = req.params;
  upload(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(500).json({ message: 'File upload error', error: err.message });
    }
    try {
      const { name, employeeId, station } = req.body;
      if (!name || !employeeId || !station || !req.file) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      const Operator = getOperatorModel(line);
      const imagePath = `/images/${req.file.filename}`;
      const newOperator = new Operator({ name, employeeId, station, imagePath });
      await newOperator.save();
      console.log(`Operator ${name} saved with image at ${imagePath}`);
      res.status(201).json(newOperator);
    } catch (error) {
      console.error('Error adding operator:', error);
      res.status(500).json({ message: 'Error adding operator', error: error.message });
    }
  });
};

exports.deleteOperator = async (req, res) => {
  const { line, id } = req.params;
  const Operator = getOperatorModel(line);
  try {
    await Operator.findByIdAndDelete(id);
    res.status(204).json();
  } catch (error) {
    console.error('Error deleting operator:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};