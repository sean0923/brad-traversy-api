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
import { ReviewModel } from '../models/Review';

// connect to DB
connectDB();

const bootcampsData = fs.readFileSync(path.join(__dirname, '../../_data/bootcamps.json'), 'utf8');
const coursesData = fs.readFileSync(path.join(__dirname, '../../_data/courses.json'), 'utf8');
const usersData = fs.readFileSync(path.join(__dirname, '../../_data/users.json'), 'utf8');
const reviewsData = fs.readFileSync(path.join(__dirname, '../../_data/reviews.json'), 'utf8');

// Import into DB
const seedData = async () => {
  try {
    await BootcampModel.create(JSON.parse(bootcampsData));
    await CourseModel.create(JSON.parse(coursesData));
    await UserModel.create(JSON.parse(usersData));
    await ReviewModel.create(JSON.parse(reviewsData));
    // await CourseModel.create(JSON.parse(coursesData));
    console.log('Bootcamp were imported from JSON'.green.inverse);
    console.log('Course were imported from JSON'.green.inverse);
    console.log('Users were imported from JSON'.green.inverse);
    console.log('Reviews were imported from JSON'.green.inverse);
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
    await ReviewModel.deleteMany({});
    console.log('All bootcamps removed'.red.inverse);
    console.log('All courses removed'.red.inverse);
    console.log('All users removed'.red.inverse);
    console.log('All reviews removed'.red.inverse);
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
