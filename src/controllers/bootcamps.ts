import { RequestHandler, Request } from 'express';
import { BootcampModel } from '../models/Bootcamp';
// import { ErrorResponse } from '../helpers/ErrorResponse';
import { asyncHandler } from '../middlewares/async-handler';
import { geocode } from '../helpers/geocode';

// * C
// @ desc     create new bootcamp
// @ route    POST /api/v1/bootcamp
// @ access   Private
const _createBootcamp: RequestHandler = asyncHandler(async (req, res, next) => {
  const bootcamp = await BootcampModel.create(req.body);
  res.status(201).json({ sucess: true, data: bootcamp });
});
export const createBootcamp = asyncHandler(_createBootcamp);

// * R
// @ desc     Get all bootcamps
// @ route    GET /api/v1/bootcamps
// @ access   Public
const _getBootcamps: RequestHandler = async (req, res, next) => {
  const queryStr = JSON.stringify(req.query);
  const queryStrWith$Sign = queryStr.replace(/\b(lt|gte|lte|gt|in)\b/g, (match) => '$' + match);
  const modifiedQuery = JSON.parse(queryStrWith$Sign);
  const allBootcamps = await BootcampModel.find(modifiedQuery);
  res.status(200).json({ sucess: true, count: allBootcamps.length, data: allBootcamps });
};
export const getBootcamps = asyncHandler(_getBootcamps);

// @ desc     Get a single bootcamp
// @ route    GET /api/v1/bootcamp/:id
// @ access   Public
const _getBootcamp: RequestHandler = async (req: Request, res, next) => {
  const singleBootcamp = await BootcampModel.findById(req.params.id);
  if (!singleBootcamp) {
    return res.status(400).json({ sucess: false, errMsg: 'bootcamp does not exsit' });
  }
  res.status(200).json({ sucess: true, data: singleBootcamp });
};
export const getBootcamp = asyncHandler(_getBootcamp);

// * U
// @ desc     update bootcamp
// @ route    PUT /api/v1/bootcamp/:id
// @ access   Private
export const _updateBootcamp: RequestHandler = async (req, res, next) => {
  const updatedBootcamp = await BootcampModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // without this it updates but return the not updated item
    runValidators: true,
  });

  if (!updatedBootcamp) {
    return res.status(400).json({ sucess: false, errMsg: 'bootcamp does not exsit' });
  }
  res.status(200).json({ sucess: true, data: updatedBootcamp });
};
export const updateBootcamp = asyncHandler(_updateBootcamp);

// * D
// @ desc     delete bootcamp
// @ route    DELETE /api/v1/bootcamp/:id
// @ access   Private
const _deleteBootcamp: RequestHandler = async (req, res, next) => {
  const deletedBootcamp = await BootcampModel.findByIdAndDelete(req.params.id);
  if (!deletedBootcamp) {
    return res.status(400).json({ sucess: false, errMsg: 'bootcamp does not exsit' });
  }
  res.status(200).json({ sucess: true, data: deletedBootcamp });
};
export const deleteBootcamp = asyncHandler(_deleteBootcamp);

// *
// @ desc     get bootcamp within certain radius
// @ route    GET /api/v1/bootcamp/radius/:zipcode/:distance
// @ access   Private
const _getBootcampsWithinRadius: RequestHandler = async (req, res, next) => {
  const { zipcode, distance } = req.params;
  const location = await geocode.geocode(zipcode);
  const lng = location[0].longitude;
  const lat = location[0].latitude;

  // If you use longitude and latitude, specify longitude first.
  const earthRadiusInMiles = 3693.2;
  const radius = parseFloat(distance) / earthRadiusInMiles;
  const bootcamps = await BootcampModel.find({
    // https://docs.mongodb.com/manual/reference/operator/query/centerSphere/
    // location: { $geoWithin: { $centerSphere: [[-88, 30], 10 / 3963.2] } },
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({ sucess: true, count: bootcamps.length, data: bootcamps });
};
export const getBootcampsWithinRadius = asyncHandler(_getBootcampsWithinRadius);
