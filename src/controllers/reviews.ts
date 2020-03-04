import { NextFunction, Response, Request } from 'express';
import { asyncHandler } from '../middlewares/async-handler';
import { ErrorResponse } from '../helpers/ErrorResponse';
import { ResWithAdvanceResults } from '../middlewares/advanced-results';
import { ReviewModel } from '../models/Review';
import { checkOwnerBeforeDbOperation } from '../helpers/check-owner-before-db-operation';
import { ReqWithUser } from '../middlewares/auth';
import { BootcampModel } from '../models/Bootcamp';

// * C
// @ desc     create review for bootcamp
// @ route    POST /api/v1/bootcamps/:bootcampsId/reviews
// @ access   Private (only user in bootcamp should be able to create)
export const createReview = asyncHandler(
  async (req: ReqWithUser, res: Response, next: NextFunction) => {
    const bootcamp = await BootcampModel.findById(req.params.bootcampId);

    if (!bootcamp) {
      return next(new ErrorResponse(`Bootcamp id ${req.params.bootcampId} does not exist`, 404));
    }

    req.body.bootcampId = req.params.bootcampId;
    req.body.userId = req.user._id;

    const review = await ReviewModel.create(req.body);

    res.status(200).json({ sucess: true, data: review });
  }
);

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

// * U
// @ desc     update review
// @ route    PATCH /api/v1/reviews/:id
// @ access   Private (only user of review should be able to update review)
export const updateReview = asyncHandler(
  async (req: ReqWithUser, res: Response, next: NextFunction) => {
    const review = await ReviewModel.findById(req.params.id);

    if (!review) {
      return next(new ErrorResponse(`Review id ${req.params.id} does not exist`, 404));
    }

    checkOwnerBeforeDbOperation(review, 'review', 'update', req, next);

    const updatedReview = await ReviewModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ sucess: true, data: updatedReview });
  }
);

// * D
// @ desc     delete review
// @ route    DELETE /api/v1/reviews/:id
// @ access   Private (only user of review should be able to create)
export const deleteReview = asyncHandler(
  async (req: ReqWithUser, res: Response, next: NextFunction) => {
    const review = await ReviewModel.findById(req.params.id);

    if (!review) {
      return next(new ErrorResponse(`Review id ${req.params.id} does not exist`, 404));
    }

    checkOwnerBeforeDbOperation(review, 'review', 'delete', req, next);

    await review.remove();

    res.status(200).json({ sucess: true, data: review });
  }
);
