import express from 'express';
import { getCourses } from '../controllers/courses';

export const coursesRouter = express.Router();

coursesRouter.route('/').get(getCourses);

// coursesRouter
//   .route('/:id')
//   .get(getBootcamp)
//   .put(updateBootcamp)
//   .delete(deleteBootcamp);
