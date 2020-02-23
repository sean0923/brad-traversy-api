import { RequestHandler, Request } from 'express';
import { CourseModel } from '../models/Course';
// import { ErrorResponse } from '../helpers/ErrorResponse';
import { asyncHandler } from '../middlewares/async-handler';
import { geocode } from '../helpers/geocode';

// * C

// * R
// @ desc     Get all courses
// @ route    GET /api/v1/courses
// @ route    GET /api/v1/:bootcampId/courses
// @ access   Public
export const getCourses: RequestHandler = asyncHandler(async (req, res, next) => {
  // const queryStr = JSON.stringify(req.query);
  // const queryStrWith$Sign = queryStr.replace(/\b(lt|gte|lte|gt|in)\b/g, (match) => '$' + match);
  // const modifiedQuery = JSON.parse(queryStrWith$Sign);

  let query = null;

  if (req.params.bootcampId) {
    query = CourseModel.find({ bootcampId: req.params.bootcampId });
  } else {
    query = CourseModel.find();
  }

  const allCourses = await query.exec();

  res.status(200).json({ sucess: true, count: allCourses.length, data: allCourses });
  // .json({ sucess: true, count: course.length, pagination, data: allBootcamps });
});
