// const getAttendanceModel = require('../models/Attendance');
// const getOperatorModel = require('../models/Operator');
// const ExcelJS = require('exceljs'); // Add at the top of your file

// exports.getAttendance = async (req, res) => {
//   const { line, date } = req.params;
//   const Attendance = getAttendanceModel(line);
//   try {
//     if (!line || !date) {
//       return res.status(400).json({ message: 'Line and date parameters are required' });
//     }
//     const attendance = await Attendance.find({ date: { $regex: `^${date}`, $options: 'i' } }).populate({
//       path: 'operatorId',
//       model: getOperatorModel(line),
//     });
//     const formattedAttendance = attendance.map((a) => {
//       // Log the raw attendance document to debug
//       console.log('Raw attendance document:', a);
//       return {
//         _id: a._id,
//         operatorName: a.operatorId?.name || 'Unknown',
//         employeeId: a.operatorId?.employeeId || 'N/A',
//         station: a.operatorId?.station || 'N/A',
//         timestamp: a.timestamp || new Date(a.date + 'T00:00:00.000Z').toISOString(), // Fallback if timestamp is missing
//         status: a.status,
//       };
//     });
//     res.status(200).json(formattedAttendance);
//   } catch (error) {
//     console.error(`Error fetching attendance for line ${line} on date ${date}:`, error.message);
//     res.status(500).json({ message: 'Failed to fetch attendance', error: error.message });
//   }
// };

// exports.markAttendance = async (req, res) => {
//   const { line } = req.params;
//   const { operatorId, timestamp } = req.body;
//   const Attendance = getAttendanceModel(line);
//   try {
//     if (!operatorId) {
//       return res.status(400).json({ message: 'Operator ID is required' });
//     }
//     const now = new Date(timestamp || Date.now());
//     if (isNaN(now.getTime())) {
//       return res.status(400).json({ message: 'Invalid timestamp provided' });
//     }
//     const date = now.toISOString().split('T')[0]; // YYYY-MM-DD for daily filtering
//     const finalTimestamp = now.toISOString(); // Full ISO 8601 timestamp
//     console.log('Marking attendance with timestamp:', finalTimestamp);

//     // Find the latest attendance for this operator on this date
//     const lastAttendance = await Attendance.findOne({ operatorId, date }).sort({ timestamp: -1 });

//     if (lastAttendance) {
//       const lastTime = new Date(lastAttendance.timestamp);
//       const diffMs = now - lastTime;
//       const diffMinutes = diffMs / (1000 * 60);
//       if (diffMinutes < 10) {
//         return res.status(400).json({ message: 'Attendance already marked for this operator within the last 10 minutes' });
//       }
//     }

//     const newAttendance = new Attendance({
//       operatorId,
//       date,
//       timestamp: finalTimestamp,
//       status: 'Present',
//     });
//     await newAttendance.save();

//     const populatedAttendance = await Attendance.findById(newAttendance._id).populate({
//       path: 'operatorId',
//       model: getOperatorModel(line),
//     });

//     const formattedAttendance = {
//       _id: populatedAttendance._id,
//       operatorName: populatedAttendance.operatorId?.name || 'Unknown',
//       employeeId: populatedAttendance.operatorId?.employeeId || 'N/A',
//       station: populatedAttendance.operatorId?.station || 'N/A',
//       timestamp: populatedAttendance.timestamp,
//       status: populatedAttendance.status,
//     };
//     res.status(201).json(formattedAttendance);
//   } catch (error) {
//     console.error('Error marking attendance:', error);
//     res.status(500).json({ message: 'Error marking attendance', error: error.message });
//   }
// };

// exports.exportAttendance = async (req, res) => {
//   const { line } = req.params;
//   const { from, to } = req.query;
//   const Attendance = getAttendanceModel(line);
//   const Operator = getOperatorModel(line);
//   try {
//     if (!from || !to) {
//       return res.status(400).json({ message: 'From and to dates are required' });
//     }
//     const attendance = await Attendance.find({
//       date: { $gte: from, $lte: to },
//     }).populate({
//       path: 'operatorId',
//       model: Operator,
//     });

//     // Create workbook and worksheet
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet('Attendance');

//     // Define columns
//     worksheet.columns = [
//       { header: 'Date', key: 'Date', width: 20 },
//       { header: 'Operator Name', key: 'Operator Name', width: 25 },
//       { header: 'Employee ID', key: 'Employee ID', width: 20 },
//       { header: 'Station', key: 'Station', width: 20 },
//       { header: 'Status', key: 'Status', width: 15 },
//     ];

//     // Add rows
//     attendance.forEach((a) => {
//       worksheet.addRow({
//         Date: a.timestamp || new Date(a.date + 'T00:00:00.000Z').toISOString(),
//         'Operator Name': a.operatorId?.name || 'Unknown',
//         'Employee ID': a.operatorId?.employeeId || 'N/A',
//         Station: a.operatorId?.station || 'N/A',
//         Status: a.status,
//       });
//     });

//     // Set headers for Excel file
//     res.setHeader(
//       'Content-Type',
//       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//     );
//     res.setHeader(
//       'Content-Disposition',
//       `attachment; filename=attendance_${line}_${from}_to_${to}.xlsx`
//     );

//     // Write workbook to response
//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (error) {
//     console.error(`Error exporting attendance for line ${line}:`, error.message);
//     res.status(500).json({ message: 'Failed to export attendance', error: error.message });
//   }
// };


const getAttendanceModel = require('../models/Attendance');
const getOperatorModel = require('../models/Operator');
const ExcelJS = require('exceljs');

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
      console.log('Raw attendance document:', a);
      return {
        _id: a._id,
        operatorName: a.operatorId?.name || 'Unknown',
        employeeId: a.operatorId?.employeeId || 'N/A',
        station: a.operatorId?.station || 'N/A',
        timestamp: a.timestamp || new Date(a.date + 'T00:00:00.000Z').toISOString(),
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
  const { operatorId, date, timestamp } = req.body;
  const Attendance = getAttendanceModel(line);
  const Operator = getOperatorModel(line);

  try {
    if (!operatorId) {
      return res.status(400).json({ message: 'Operator ID is required' });
    }
    const now = new Date(timestamp || Date.now());
    if (isNaN(now.getTime())) {
      return res.status(400).json({ message: 'Invalid timestamp provided' });
    }
    const finalTimestamp = now.toISOString();
    console.log('Marking attendance with timestamp:', finalTimestamp);

    const lastAttendance = await Attendance.findOne({ operatorId, date }).sort({ timestamp: -1 });

    if (lastAttendance) {
      const lastTime = new Date(lastAttendance.timestamp);
      const diffMs = now - lastTime;
      const diffMinutes = diffMs / (1000 * 60);
      if (diffMinutes < 10) {
        return res.status(400).json({ message: 'Attendance already marked for this operator within the last 10 minutes' });
      }
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
      model: Operator,
    });

    const formattedAttendance = {
      _id: populatedAttendance._id,
      operatorName: populatedAttendance.operatorId?.name || 'Unknown',
      employeeId: populatedAttendance.operatorId?.employeeId || 'N/A',
      station: populatedAttendance.operatorId?.station || 'N/A',
      timestamp: populatedAttendance.timestamp,
      status: populatedAttendance.status,
    };

    // Publish to MQTT
    const operator = await Operator.findById(operatorId);
    if (operator) {
      const mqttClient = req.app.get('mqttClient');
      if (mqttClient) {
        const message = JSON.stringify({
          ledIndex: operator.ledIndex,
          status: 'green' // Present
        });
        
        mqttClient.publish(`attendance/${line}/led`, message, (err) => {
          if (err) {
            console.error('Failed to publish to MQTT:', err);
          } else {
            console.log(`Published to MQTT: ${message}`);
          }
        });
      }
    }

    res.status(201).json(formattedAttendance);
  } catch (error) {
    console.error('Error marking attendance:', error);
    //res.status(500).json({ message: 'Error marking attendance', error: error.message });
  }
};

exports.markFailedAttendance = async (req, res) => {
  const { line } = req.params;
  const { station, timestamp } = req.body;
  const Operator = getOperatorModel(line);

  try {
    // Get all operators for this station
    const stationOperators = await Operator.find({ station });
    
    // Mark all operators in the station as absent (red LED)
    const mqttClient = req.app.get('mqttClient');
    if (mqttClient) {
      stationOperators.forEach(operator => {
        const message = JSON.stringify({
          ledIndex: operator.ledIndex,
          status: 'red' // Absent
        });
        
        mqttClient.publish(`attendance/${line}/led`, message, (err) => {
          if (err) {
            console.error('Failed to publish to MQTT:', err);
          } else {
            console.log(`Published to MQTT: ${message}`);
          }
        });
      });
    }

    res.status(200).json({ message: 'Failed attendance recorded' });
  } catch (error) {
    console.error('Error marking failed attendance:', error);
    res.status(500).json({ message: 'Error marking failed attendance', error: error.message });
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

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance');

    worksheet.columns = [
      { header: 'Date', key: 'Date', width: 20 },
      { header: 'Operator Name', key: 'Operator Name', width: 25 },
      { header: 'Employee ID', key: 'Employee ID', width: 20 },
      { header: 'Station', key: 'Station', width: 20 },
      { header: 'Status', key: 'Status', width: 15 },
    ];

    attendance.forEach((a) => {
      worksheet.addRow({
        Date: a.timestamp || new Date(a.date + 'T00:00:00.000Z').toISOString(),
        'Operator Name': a.operatorId?.name || 'Unknown',
        'Employee ID': a.operatorId?.employeeId || 'N/A',
        Station: a.operatorId?.station || 'N/A',
        Status: a.status,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=attendance_${line}_${from}_to_${to}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(`Error exporting attendance for line ${line}:`, error.message);
    res.status(500).json({ message: 'Failed to export attendance', error: error.message });
  }
};


