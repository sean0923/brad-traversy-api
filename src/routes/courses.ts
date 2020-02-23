import express from 'express';
import { getCourses } from '../controllers/courses';

export const coursesRouter = express.Router({ mergeParams: true });

// courses/
// /:bootcampId/courses/
coursesRouter.route('/').get(getCourses);
// coursesRouter.route('/').get(getCourses);

// coursesRouter
//   .route('/:id')
//   .get(getBootcamp)
//   .put(updateBootcamp)
//   .delete(deleteBootcamp);
