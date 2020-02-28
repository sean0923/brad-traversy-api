import express from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courses';

import { advancedResults } from '../middlewares/advanced-results';
import { CourseModel } from '../models/Course';

// ! mergeParams is required so that redirect from bootcamps/:bootcampId/courses contains req.params
export const coursesRouter = express.Router({ mergeParams: true });

// api/v1/courses/
// api/v1/bootcamps/:bootcampId/courses/
coursesRouter
  .route('/')
  .get(advancedResults(CourseModel, { populate: 'bootcampId', select: 'name' }) as any, getCourses)
  .post(createCourse);

coursesRouter
  .route('/:id')
  .get(getCourse)
  .patch(updateCourse)
  .delete(deleteCourse);
