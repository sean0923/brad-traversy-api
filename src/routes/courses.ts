import express from 'express';
import { getCourses } from '../controllers/courses';

// ! mergeParams is required so that redirect from bootcamps/:bootcampId/courses contains req.params
export const coursesRouter = express.Router({ mergeParams: true });

// /courses/
// /bootcamps/:bootcampId/courses/
coursesRouter.route('/').get(getCourses);
