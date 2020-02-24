import express from 'express';
import {
  createBootcamp,
  getBootcamps,
  getBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsWithinRadius,
} from '../controllers/bootcamps';

import { coursesRouter } from './courses';

export const bootcampsRouter = express.Router();

// Re-route to courses
bootcampsRouter.use('/:bootcampId/courses', coursesRouter);

// get bootcamp within radius
bootcampsRouter.route('/radius/:zipcode/:distance').get(getBootcampsWithinRadius);

bootcampsRouter
  .route('/')
  .get(getBootcamps)
  .post(createBootcamp);

bootcampsRouter
  .route('/:id')
  .get(getBootcamp)
  .patch(updateBootcamp)
  .delete(deleteBootcamp);

// bootcampsRouter.get('/', (req, res) => {
//   res.send('a');
// });

// bootcampsRouter.get('/:id', (req, res) => {
//   res.send('a');
// });

// bootcampsRouter.post('/', (req, res) => {
//   res.send('a');
// });

// bootcampsRouter.put('/:id', (req, res) => {
//   res.send('a');
// });

// bootcampsRouter.delete('/:id', (req, res) => {
//   res.send('a');
// });
