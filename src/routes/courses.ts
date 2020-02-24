import express from 'express';
import { getCourses, getCourse, createCourse } from '../controllers/courses';

// ! mergeParams is required so that redirect from bootcamps/:bootcampId/courses contains req.params
export const coursesRouter = express.Router({ mergeParams: true });

// api/v1/courses/
// api/v1/bootcamps/:bootcampId/courses/
coursesRouter
  .route('/')
  .get(getCourses)
  .post(createCourse);

coursesRouter.route('/:id').get(getCourse);
