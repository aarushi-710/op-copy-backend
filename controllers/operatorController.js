const getOperatorModel = require('../models/Operator');

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
  const { name, employeeId, station, imagePath } = req.body;

  try {
    if (!name || !employeeId || !station || !imagePath) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const Operator = getOperatorModel(line);
    const newOperator = new Operator({ name, employeeId, station, imagePath });
    await newOperator.save();
    console.log(`Operator ${name} saved with imagePath at ${imagePath}`);
    res.status(201).json(newOperator);
  } catch (error) {
    console.error('Error adding operator:', error);
    res.status(500).json({ message: 'Error adding operator', error: error.message });
  }
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