import { RequestHandler } from 'express';
import { CourseModel } from '../models/Course';
import { asyncHandler } from '../middlewares/async-handler';

// * C

// * R
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

// * U

// * D
