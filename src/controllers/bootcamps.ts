import { RequestHandler } from 'express';

// @ desc     Get all bootcamps
// @ route    GET /api/v1/bootcamps
// @ access   Public
export const getBootcamps: RequestHandler = (req, res, next) => {
  res.status(200).json({ msg: 'get all bootcamps' });
};

// @ desc     Get a single bootcamp
// @ route    GET /api/v1/bootcamp/:id
// @ access   Public
export const getBootcamp: RequestHandler = (req, res, next) => {
  res.status(200).json({ msg: 'get a single bootcamp' });
};

// @ desc     create new bootcamp
// @ route    POST /api/v1/bootcamp
// @ access   Private
export const createBootcamp: RequestHandler = (req, res, next) => {
  res.status(200).json({ msg: 'create new bootcamp' });
};

// @ desc     update bootcamp
// @ route    PUT /api/v1/bootcamp/:id
// @ access   Private
export const updateBootcamp: RequestHandler = (req, res, next) => {
  res.status(200).json({ msg: 'update bootcamp' });
};

// @ desc     delete bootcamp
// @ route    DELETE /api/v1/bootcamp/:id
// @ access   Private
export const deleteBootcamp: RequestHandler = (req, res, next) => {
  res.status(200).json({ msg: 'delete bootcamp' });
};
