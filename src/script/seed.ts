import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import 'colors';

// this need to be invoked early
dotenv.config({ path: './config/config.env' });

import { BootcampModel } from '../models/Bootcamp';
import { CourseModel } from '../models/Course';
import { connectDB } from '../helpers/db';

// connect to DB
connectDB();

const bootcampsData = fs.readFileSync(path.join(__dirname, '../../_data/bootcamps.json'), 'utf8');
const coursesData = fs.readFileSync(path.join(__dirname, '../../_data/courses.json'), 'utf8');

// Import into DB
const seedBootcampsFromJson = async () => {
  try {
    await BootcampModel.create(JSON.parse(bootcampsData));
    await CourseModel.create(JSON.parse(coursesData));
    console.log('Bootcamp was imported from JSON'.green.inverse);
    console.log('Course was imported from JSON'.green.inverse);
    process.exit();
  } catch (error) {
    console.log('error: ', error);
  }
};

// Destroy Data
const deleteAllBootcampsFromDB = async () => {
  try {
    await BootcampModel.deleteMany({});
    await CourseModel.deleteMany({});
    console.log('All bootcamp removed'.green.inverse);
    console.log('All courses removed'.green.inverse);
    process.exit();
  } catch (error) {
    console.log('error: ', error);
  }
};

const userInput = process.argv[2];
if (userInput === '--d') {
  deleteAllBootcampsFromDB();
}

if (userInput === '--i') {
  seedBootcampsFromJson();
}
