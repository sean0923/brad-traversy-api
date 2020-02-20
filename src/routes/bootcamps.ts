import express from 'express';
import {
  createBootcamp,
  getBootcamps,
  getBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsWithinRadius,
} from '../controllers/bootcamps';

export const bootcampsRouter = express.Router();

bootcampsRouter.route('/radius/:zipcode/:distance').get(getBootcampsWithinRadius);

bootcampsRouter
  .route('/')
  .get(getBootcamps)
  .post(createBootcamp);

bootcampsRouter
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
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
