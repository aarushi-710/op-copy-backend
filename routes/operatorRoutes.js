
const express = require('express');
const router = express.Router();
const { getOperators, addOperator, deleteOperator } = require('../controllers/operatorController');

router.get('/:line', getOperators);
router.post('/:line', addOperator);
router.delete('/:line/:id', deleteOperator);

module.exports = router;
