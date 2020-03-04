import express from 'express';
import { getReviews, getReview } from '../controllers/reviews';

import { advancedResults } from '../middlewares/advanced-results';
import { ReviewModel } from '../models/Review';

// ! mergeParams is required so that redirect from bootcamps/:bootcampId/courses contains req.params
export const reviewRouter = express.Router({ mergeParams: true });

// api/v1/reviews/
// api/v1/bootcamps/:bootcampId/reviews/
reviewRouter
  .route('/')
  .get(advancedResults(ReviewModel, { populate: 'bootcampId', select: 'name' }) as any, getReviews);
// .post(protect, createCourse);

// api/v1/reviews/:id
reviewRouter.route('/:id').get(getReview);
//   .patch(protect, updateCourse)
//   .delete(protect, authorize('admin', 'publisher') as any, deleteCourse); //! protect then authorize! order MATTERS!
