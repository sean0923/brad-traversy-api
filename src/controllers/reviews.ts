import { NextFunction, Response, Request } from 'express';
import { asyncHandler } from '../middlewares/async-handler';
import { ErrorResponse } from '../helpers/ErrorResponse';
import { ResWithAdvanceResults } from '../middlewares/advanced-results';
import { ReviewModel } from '../models/Review';

// * R (all)
// @ desc     Get all reviews
// @ route    GET /api/v1/reviews
// @ route    GET /api/v1/:bootcampId/reviews
// @ access   Public
export const getReviews = asyncHandler(
  async (req: Request, res: ResWithAdvanceResults, next: NextFunction) => {
    let query = null;

    if (req.params.bootcampId) {
      query = ReviewModel.find({ bootcampId: req.params.bootcampId });
      query.populate('bootcampId', 'name careers');

      const allCourses = await query.exec();

      res.status(200).json({ sucess: true, count: allCourses.length, data: allCourses });
    } else {
      res.status(200).json(res.advancedResults);
    }
  }
);

// * R (single)
// @ desc     Get a single review
// @ route    GET /api/v1/reivews/:id
// @ access   Public
export const getReview = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let query = ReviewModel.findById(req.params.id);

  query.populate('bootcampId', 'name careers');

  const singleReview = await query.exec();
  if (!singleReview) {
    return next(new ErrorResponse(`Review id ${req.params.id} does not exist`, 404));
  }

  res.status(200).json({ sucess: true, data: singleReview });
});
