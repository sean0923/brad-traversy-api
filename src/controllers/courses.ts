import { RequestHandler, NextFunction, Response, Request } from 'express';
import { CourseModel } from '../models/Course';
import { BootcampModel } from '../models/Bootcamp';
import { asyncHandler } from '../middlewares/async-handler';
import { ErrorResponse } from '../helpers/ErrorResponse';
import { ResWithAdvanceResults } from '../middlewares/advanced-results';

import { ReqWithUser } from '../middlewares/auth';
import { checkOwnerBeforeDbOperation } from '../helpers/check-owner-before-db-operation';

// * C
// @ desc     create course
// @ route    POST /api/v1/bootcamps/:bootcampsId/courses
// @ access   Private (only bootcamp owner should be able to create)
export const createCourse = asyncHandler(
  async (req: ReqWithUser, res: Response, next: NextFunction) => {
    const bootcamp = await BootcampModel.findById(req.params.bootcampId);
    console.log('bootcamp: ', bootcamp);

    if (!bootcamp) {
      return next(new ErrorResponse(`Bootcamp id ${req.params.bootcampId} does not exist`, 404));
    }

    checkOwnerBeforeDbOperation(bootcamp, 'course', 'create', req, next);

    req.body.bootcampId = req.params.bootcampId;
    req.body.userId = req.user.id;

    const course = await CourseModel.create(req.body);

    res.status(200).json({ sucess: true, data: course });
  }
);

// * R (all)
// @ desc     Get all courses
// @ route    GET /api/v1/courses
// @ route    GET /api/v1/:bootcampId/courses
// @ access   Public
export const getCourses = asyncHandler(
  async (req: Request, res: ResWithAdvanceResults, next: NextFunction) => {
    let query = null;

    if (req.params.bootcampId) {
      query = CourseModel.find({ bootcampId: req.params.bootcampId });
      query.populate('bootcampId', 'name careers');

      const allCourses = await query.exec();

      res.status(200).json({ sucess: true, count: allCourses.length, data: allCourses });
    } else {
      res.status(200).json(res.advancedResults);
    }
  }
);

// * R (single)
// @ desc     Get single course
// @ route    GET /api/v1/courses/:id
// @ access   Public
export const getCourse = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let query = CourseModel.findById(req.params.id);

  query.populate('bootcampId', 'name careers');

  const singleCourse = await query.exec();
  if (!singleCourse) {
    return next(new ErrorResponse(`Course id ${req.params.id} does not exist`, 404));
  }

  res.status(200).json({ sucess: true, data: singleCourse });
});

// * U
// @ desc     update course
// @ route    PATCH /api/v1/courses/:id
// @ access   Private (only course(bootcamp) owner should be able to update)
export const updateCourse = asyncHandler(
  async (req: ReqWithUser, res: Response, next: NextFunction) => {
    const course = await CourseModel.findById(req.params.id);

    if (!course) {
      return next(new ErrorResponse(`Course id ${req.params.id} does not exist`, 404));
    }

    checkOwnerBeforeDbOperation(course, 'course', 'update', req, next);

    const updatedCourse = await CourseModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // without this it updates but return the not updated item
      runValidators: true,
    });

    res.status(200).json({ sucess: true, data: updatedCourse });
  }
);

// * D
// @ desc     delete course
// @ route    DELETE /api/v1/courses/:id
// @ access   Private (only bootcamp owner should be able to delete)
export const deleteCourse = asyncHandler(
  async (req: ReqWithUser, res: Response, next: NextFunction) => {
    const course = await CourseModel.findById(req.params.id);

    if (!course) {
      return next(new ErrorResponse(`Course id ${req.params.id} does not exist`, 404));
    }

    checkOwnerBeforeDbOperation(course, 'course', 'delete', req, next);

    await course.remove();

    res.status(200).json({ sucess: true, data: course });
  }
);
