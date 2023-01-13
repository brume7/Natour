const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './../../config.env' });
const Tour = require('./../../models/tourModel');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.set('strictQuery', true);

mongoose.connect(DB).then((con) => {
  console.log('Database connection sucessfull');
});

const tours = JSON.parse(fs.readFileSync('./tours-simple.json', 'utf-8'));

let importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data uploaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

let deleteData = async () => {
  try {
    await Tour.deleteMany({});
    console.log('Data deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else {
  process.exit();
}

console.log(process.argv);
