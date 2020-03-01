import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import 'colors';

// this need to be invoked early
dotenv.config({ path: './config/config.env' });

import { BootcampModel } from '../models/Bootcamp';
import { CourseModel } from '../models/Course';
import { UserModel } from '../models/User';
import { connectDB } from '../helpers/db';

// connect to DB
connectDB();

const bootcampsData = fs.readFileSync(path.join(__dirname, '../../_data/bootcamps.json'), 'utf8');
const coursesData = fs.readFileSync(path.join(__dirname, '../../_data/courses.json'), 'utf8');
const usersData = fs.readFileSync(path.join(__dirname, '../../_data/users.json'), 'utf8');

// Import into DB
const seedData = async () => {
  try {
    await BootcampModel.create(JSON.parse(bootcampsData));
    await CourseModel.create(JSON.parse(coursesData));
    await UserModel.create(JSON.parse(usersData));
    // await CourseModel.create(JSON.parse(coursesData));
    console.log('Bootcamp were imported from JSON'.green.inverse);
    console.log('Course were imported from JSON'.green.inverse);
    console.log('Users were imported from JSON'.green.inverse);
    process.exit();
  } catch (error) {
    console.log('error: ', error);
  }
};

// Destroy Data
const deleteData = async () => {
  try {
    await BootcampModel.deleteMany({});
    await CourseModel.deleteMany({});
    await UserModel.deleteMany({});
    console.log('All bootcamps removed'.green.inverse);
    console.log('All courses removed'.green.inverse);
    console.log('All users removed'.green.inverse);
    process.exit();
  } catch (error) {
    console.log('error: ', error);
  }
};

const userInput = process.argv[2];
if (userInput === '--d') {
  deleteData();
}

if (userInput === '--i') {
  seedData();
}
