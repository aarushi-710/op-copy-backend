// const express = require('express');
// const router = express.Router();
// const { getAttendance, markAttendance, exportAttendance } = require('../controllers/attendanceController');

// router.get('/:line/:date', getAttendance);
// router.post('/:line', markAttendance);
// router.get('/export/:line', exportAttendance);

// module.exports = router;

const express = require('express');
const router = express.Router();
const { getAttendance, markAttendance, exportAttendance, markFailedAttendance } = require('../controllers/attendanceController');

router.get('/:line/:date', getAttendance);
router.post('/:line', markAttendance);
router.post('/:line/fail', markFailedAttendance);
router.get('/export/:line', exportAttendance);

module.exports = router;