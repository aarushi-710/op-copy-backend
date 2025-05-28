const express = require('express');
const router = express.Router();
const { getAttendance, markAttendance, exportAttendance } = require('../controllers/attendanceController');

router.get('/:line/:date', getAttendance);
router.post('/:line', markAttendance);
router.get('/export/:line', exportAttendance);

module.exports = router;