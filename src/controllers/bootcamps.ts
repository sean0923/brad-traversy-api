import path from 'path';
import { RequestHandler, Request } from 'express';
import { BootcampModel } from '../models/Bootcamp';
import { ErrorResponse } from '../helpers/ErrorResponse';
import { asyncHandler } from '../middlewares/async-handler';
import { geocode } from '../helpers/geocode';
import { UploadedFile } from 'express-fileupload';
// import moduleName from '../public/uploads'

// * C
// @ desc     create new bootcamp
// @ route    POST /api/v1/bootcamp
// @ access   Private
export const createBootcamp: RequestHandler = asyncHandler(async (req, res, next) => {
  const bootcamp = await BootcampModel.create(req.body);
  res.status(201).json({ sucess: true, data: bootcamp });
});

// * R
// @ desc     Get all bootcamps
// @ route    GET /api/v1/bootcamps
// @ access   Public
export const getBootcamps: RequestHandler = asyncHandler(async (req, res, next) => {
  const queryStr = JSON.stringify(req.query);
  const queryStrWith$Sign = queryStr.replace(/\b(lt|gte|lte|gt|in)\b/g, (match) => '$' + match);
  const modifiedQuery = JSON.parse(queryStrWith$Sign);

  const keysToBeDeletedFromOriginalQueryStr = ['select', 'sort', 'page', 'limit'];

  keysToBeDeletedFromOriginalQueryStr.forEach((key) => delete modifiedQuery[key]);

  let query = BootcampModel.find(modifiedQuery);

  if (req.query.select) {
    const selectBy = req.query.select.split(',').join(' ');
    query = query.select(selectBy);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('createdAt');
  }

  // pagination
  const pagination: any = {};
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit) : 25;
  const startIdx = (page - 1) * limit;
  const endIdx = page * limit;

  const total = await BootcampModel.countDocuments();

  if (endIdx < total) {
    pagination.next = { page: page + 1, limit };
  }

  if (startIdx > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  query = query.skip(startIdx).limit(limit);
  query = query.populate('courses');

  const allBootcamps = await query.exec();

  res
    .status(200)
    .json({ sucess: true, count: allBootcamps.length, pagination, data: allBootcamps });
});

// @ desc     Get a single bootcamp
// @ route    GET /api/v1/bootcamp/:id
// @ access   Public
export const getBootcamp: RequestHandler = asyncHandler(async (req: Request, res, next) => {
  const singleBootcamp = await BootcampModel.findById(req.params.id).populate('courses');
  if (!singleBootcamp) {
    return next(new ErrorResponse('bootcamp does not exist', 400));
  }

  res.status(200).json({ sucess: true, data: singleBootcamp });
});

// * U
// @ desc     update bootcamp
// @ route    PUT /api/v1/bootcamp/:id
// @ access   Private
export const updateBootcamp: RequestHandler = asyncHandler(async (req, res, next) => {
  const updatedBootcamp = await BootcampModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // without this it updates but return the not updated item
    runValidators: true,
  });

  if (!updatedBootcamp) {
    return next(new ErrorResponse('bootcamp does not exist', 400));
  }
  res.status(200).json({ sucess: true, data: updatedBootcamp });
});

// @ desc     upload bootcamp photo
// @ route    PATCH /api/v1/bootcamp/:id/photo
// @ access   Private
export const uploadPhoto: RequestHandler = asyncHandler(async (req, res, next) => {
  if (!req.files) {
    return next(new ErrorResponse('File is required', 400));
  }

  const file: UploadedFile = req.files.files as UploadedFile;

  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Only image can be uploaded', 400));
  }

  const fileSizeLimit = parseInt(process.env.UPLOAD_FILE_SIZE_LIMIT as string);
  if (file.size > fileSizeLimit) {
    return next(
      new ErrorResponse(`File size should be smaller than ${fileSizeLimit / 1000000}MB`, 400)
    );
  }

  const folderName = __dirname + `/../public/uploads`;
  const customFilename = `photo_${req.params.id}${path.extname(file.name)}`;

  file.mv(path.resolve(`${folderName}/${customFilename}`), async (err) => {
    if (err) {
      console.log('err: ', err);
      return next(new ErrorResponse(`Fail to upload file`, 500));
    }

    const updatedBootcamp = await BootcampModel.findOneAndUpdate(
      req.params.id,
      { photo: customFilename },
      { new: true }
    );

    res.status(200).json({ sucess: true, data: updatedBootcamp });
  });
});

// * D
// @ desc     delete bootcamp
// @ route    DELETE /api/v1/bootcamp/:id
// @ access   Private
export const deleteBootcamp: RequestHandler = asyncHandler(async (req, res, next) => {
  // ! findByIdAndDelete does not trigger pre `delete`
  // ! must use find then remove in order for `pre` to fire
  // const deletedBootcamp = await BootcampModel.findByIdAndDelete(req.params.id);
  const bootcamp = await BootcampModel.findById(req.params.id);
  bootcamp?.remove();

  if (!bootcamp) {
    return res.status(400).json({ sucess: false, errMsg: 'bootcamp does not exsit' });
  }
  res.status(200).json({ sucess: true, data: bootcamp });
});

// *
// @ desc     get bootcamp within certain radius
// @ route    GET /api/v1/bootcamp/radius/:zipcode/:distance
// @ access   Private
export const getBootcampsWithinRadius: RequestHandler = asyncHandler(async (req, res, next) => {
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
});
