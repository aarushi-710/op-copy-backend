const getAttendanceModel = require('../models/Attendance');
const getOperatorModel = require('../models/Operator');

exports.getAttendance = async (req, res) => {
  const { line, date } = req.params;
  const Attendance = getAttendanceModel(line);
  try {
    if (!line || !date) {
      return res.status(400).json({ message: 'Line and date parameters are required' });
    }
    const attendance = await Attendance.find({ date: { $regex: `^${date}`, $options: 'i' } }).populate({
      path: 'operatorId',
      model: getOperatorModel(line),
    });
    const formattedAttendance = attendance.map((a) => {
      // Log the raw attendance document to debug
      console.log('Raw attendance document:', a);
      return {
        _id: a._id,
        operatorName: a.operatorId?.name || 'Unknown',
        employeeId: a.operatorId?.employeeId || 'N/A',
        station: a.operatorId?.station || 'N/A',
        timestamp: a.timestamp || new Date(a.date + 'T00:00:00.000Z').toISOString(), // Fallback if timestamp is missing
        status: a.status,
      };
    });
    res.status(200).json(formattedAttendance);
  } catch (error) {
    console.error(`Error fetching attendance for line ${line} on date ${date}:`, error.message);
    res.status(500).json({ message: 'Failed to fetch attendance', error: error.message });
  }
};

exports.markAttendance = async (req, res) => {
  const { line } = req.params;
  const { operatorId, timestamp } = req.body;
  const Attendance = getAttendanceModel(line);
  try {
    if (!operatorId) {
      return res.status(400).json({ message: 'Operator ID is required' });
    }
    const now = new Date(timestamp || Date.now());
    if (isNaN(now.getTime())) {
      return res.status(400).json({ message: 'Invalid timestamp provided' });
    }
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD for daily filtering
    const finalTimestamp = now.toISOString(); // Full ISO 8601 timestamp
    console.log('Marking attendance with timestamp:', finalTimestamp);

    // Find the latest attendance for this operator on this date
    const lastAttendance = await Attendance.findOne({ operatorId, date }).sort({ timestamp: -1 });

    if (lastAttendance) {
      const lastTime = new Date(lastAttendance.timestamp);
      const diffMs = now - lastTime;
      const diffHours = diffMs / (10 * 60 * 60);
      if (diffHours < 1) {
        return res.status(400).json({ message: 'Attendance already marked for this operator within the last hour' });
      }
    }

    const existing = await Attendance.findOne({ operatorId, date });
    if (existing) {
      return res.status(400).json({ message: 'Attendance already marked for this operator today' });
    }

    const newAttendance = new Attendance({
      operatorId,
      date,
      timestamp: finalTimestamp,
      status: 'Present',
    });
    await newAttendance.save();

    const populatedAttendance = await Attendance.findById(newAttendance._id).populate({
      path: 'operatorId',
      model: getOperatorModel(line),
    });

    const formattedAttendance = {
      _id: populatedAttendance._id,
      operatorName: populatedAttendance.operatorId?.name || 'Unknown',
      employeeId: populatedAttendance.operatorId?.employeeId || 'N/A',
      station: populatedAttendance.operatorId?.station || 'N/A',
      timestamp: populatedAttendance.timestamp,
      status: populatedAttendance.status,
    };
    res.status(201).json(formattedAttendance);
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Error marking attendance', error: error.message });
  }
};

exports.exportAttendance = async (req, res) => {
  const { line } = req.params;
  const { from, to } = req.query;
  const Attendance = getAttendanceModel(line);
  const Operator = getOperatorModel(line);
  try {
    if (!from || !to) {
      return res.status(400).json({ message: 'From and to dates are required' });
    }
    const attendance = await Attendance.find({
      date: { $gte: from, $lte: to },
    }).populate({
      path: 'operatorId',
      model: Operator,
    });
    const data = attendance.map((a) => ({
      Date: a.timestamp || new Date(a.date + 'T00:00:00.000Z').toISOString(),
      'Operator Name': a.operatorId?.name || 'Unknown',
      'Employee ID': a.operatorId?.employeeId || 'N/A',
      Station: a.operatorId?.station || 'N/A',
      Status: a.status,
    }));
    res.status(200).json(data);
  } catch (error) {
    console.error(`Error exporting attendance for line ${line}:`, error.message);
    res.status(500).json({ message: 'Failed to export attendance', error: error.message });
  }
};