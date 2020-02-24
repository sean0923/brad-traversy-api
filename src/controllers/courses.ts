import { RequestHandler } from 'express';
import { CourseModel } from '../models/Course';
import { BootcampModel } from '../models/Bootcamp';
import { asyncHandler } from '../middlewares/async-handler';
import { ErrorResponse } from '../helpers/ErrorResponse';

// * C
// @ desc     create course
// @ route    POST /api/v1/bootcamps/:bootcampsId/courses
// @ access   Private (only bootcamp owner should be able to create)
export const createCourse: RequestHandler = asyncHandler(async (req, res, next) => {
  const bootcamp = await BootcampModel.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp id ${req.params.bootcampId} does not exist`, 404));
  }

  req.body.bootcampId = req.params.bootcampId;

  const course = await CourseModel.create(req.body);

  res.status(200).json({ sucess: true, data: course });
});

// * R (all)
// @ desc     Get all courses
// @ route    GET /api/v1/courses
// @ route    GET /api/v1/:bootcampId/courses
// @ access   Public
export const getCourses: RequestHandler = asyncHandler(async (req, res, next) => {
  let query = null;

  if (req.params.bootcampId) {
    query = CourseModel.find({ bootcampId: req.params.bootcampId });
  } else {
    query = CourseModel.find();
  }

  query.populate('bootcampId', 'name careers');

  const allCourses = await query.exec();

  res.status(200).json({ sucess: true, count: allCourses.length, data: allCourses });
});

// * R (single)
// @ desc     Get single course
// @ route    GET /api/v1/courses/:id
// @ access   Public
export const getCourse: RequestHandler = asyncHandler(async (req, res, next) => {
  let query = CourseModel.findById(req.params.id);

  query.populate('bootcampId', 'name careers');

  const singleCourse = await query.exec();

  res.status(200).json({ sucess: true, data: singleCourse });
});

// * U
// @ desc     update course
// @ route    PATCH /api/v1/courses/:id
// @ access   Private (only bootcamp owner should be able to update)
export const updateCourse: RequestHandler = asyncHandler(async (req, res, next) => {
  const course = await CourseModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // without this it updates but return the not updated item
    runValidators: true,
  });

  if (!course) {
    return next(new ErrorResponse(`Course id ${req.params.id} does not exist`, 404));
  }

  res.status(200).json({ sucess: true, data: course });
});

// * D
