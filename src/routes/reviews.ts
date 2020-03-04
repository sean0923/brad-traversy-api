import express from 'express';
import {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviews';

import { advancedResults } from '../middlewares/advanced-results';
import { ReviewModel } from '../models/Review';
import { protect, authorize } from '../middlewares/auth';

// ! mergeParams is required so that redirect from bootcamps/:bootcampId/courses contains req.params
export const reviewRouter = express.Router({ mergeParams: true });

// api/v1/reviews/
// api/v1/bootcamps/:bootcampId/reviews/
reviewRouter
  .route('/')
  .get(advancedResults(ReviewModel, { populate: 'bootcampId', select: 'name' }) as any, getReviews)
  .post(protect, authorize('user', 'admin') as any, createReview);

// api/v1/reviews/:id
reviewRouter
  .route('/:id')
  .get(getReview)
  .patch(protect, updateReview)
  .delete(protect, deleteReview);
