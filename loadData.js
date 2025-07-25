const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const getUserModel = require('./models/User');

const loadData = async () => {
  await connectDB();

  const UserLine1 = getUserModel('line1');
  const UserLine2 = getUserModel('line2');
  const UserLine3 = getUserModel('line3');

  await UserLine1.deleteMany({});
  await UserLine2.deleteMany({});
  await UserLine3.deleteMany({});

  await UserLine1.create({
    username: 'Line1',
    password: await bcrypt.hash('Line1', 10),
    line: 'line1',
  });
  await UserLine2.create({
    username: 'Line2',
    password: await bcrypt.hash('Line2', 10),
    line: 'line2',
  });
  await UserLine3.create({
    username: 'Line3',
    password: await bcrypt.hash('Line3', 10),
    line: 'line3',
  });

  console.log('Data loaded');
  process.exit();
};

loadData();