import express from 'express';
import {
  createBootcamp,
  getBootcamps,
  getBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsWithinRadius,
  uploadPhoto,
} from '../controllers/bootcamps';

import { advancedResults } from '../middlewares/advanced-results';

import { coursesRouter } from './courses';
import { BootcampModel } from '../models/Bootcamp';
import { protect, authorize } from '../middlewares/auth';
import { reviewRouter } from './reviews';

export const bootcampsRouter = express.Router();

// Re-route to courses
bootcampsRouter.use('/:bootcampId/courses', coursesRouter);

// Re-route to reviews
bootcampsRouter.use('/:bootcampId/reviews', reviewRouter);

// get bootcamp within radius
bootcampsRouter.route('/radius/:zipcode/:distance').get(getBootcampsWithinRadius);

// upload photo
bootcampsRouter.use('/:id/photo', uploadPhoto);

//

bootcampsRouter
  .route('/')
  .get(advancedResults(BootcampModel, 'courses') as any, getBootcamps)
  .post(protect, authorize('admin', 'publisher') as any, createBootcamp);

bootcampsRouter
  .route('/:id')
  .get(getBootcamp)
  .patch(protect, updateBootcamp)
  .delete(protect, deleteBootcamp);

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
