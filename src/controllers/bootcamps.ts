import path from 'path';
import { RequestHandler, Request, Response, NextFunction } from 'express';
import { BootcampModel } from '../models/Bootcamp';
import { ErrorResponse } from '../helpers/ErrorResponse';
import { asyncHandler } from '../middlewares/async-handler';
import { geocode } from '../helpers/geocode';
import { UploadedFile } from 'express-fileupload';
// import moduleName from '../public/uploads'
import { ResWithAdvanceResults } from '../middlewares/advanced-results';
import { ReqWithUser } from '../middlewares/auth';
import { checkOwnerBeforeDbOperation } from '../helpers/check-owner-before-db-operation';

// * C
// @ desc     create new bootcamp
// @ route    POST /api/v1/bootcamp
// @ access   Private
export const createBootcamp = asyncHandler(
  async (req: ReqWithUser, res: Response, next: NextFunction) => {
    const userHasBootcamp = await BootcampModel.findOne({ userId: req.user._id });
    const userNotAdmin = req.user.role !== 'admin';

    if (userHasBootcamp && userNotAdmin) {
      return next(
        new ErrorResponse(`user id ${req.user._id} cannot create more than one bootcamp`, 403)
      );
    }

    const bootcamp = await BootcampModel.create(req.body);
    res.status(201).json({ sucess: true, data: bootcamp });
  }
);

// * R
// @ desc     Get all bootcamps
// @ route    GET /api/v1/bootcamps
// @ access   Public
export const getBootcamps = asyncHandler(
  async (req: Request, res: ResWithAdvanceResults, next: NextFunction) => {
    res.status(200).json(res.advancedResults);
  }
);

// @ desc     Get a single bootcamp
// @ route    GET /api/v1/bootcamp/:id
// @ access   Public
export const getBootcamp: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const singleBootcamp = await BootcampModel.findById(req.params.id).populate('courses');
    if (!singleBootcamp) {
      return next(new ErrorResponse('bootcamp does not exist', 400));
    }

    res.status(200).json({ sucess: true, data: singleBootcamp });
  }
);

// * U
// @ desc     update bootcamp
// @ route    PATCH /api/v1/bootcamp/:id
// @ access   Private
export const updateBootcamp = asyncHandler(
  async (req: ReqWithUser, res: Response, next: NextFunction) => {
    const bootcamp = await BootcampModel.findById(req.params.id);

    if (!bootcamp) {
      return next(new ErrorResponse('bootcamp does not exist', 400));
    }

    checkOwnerBeforeDbOperation(bootcamp, 'bootcamp', 'update', req, next);

    const updatedBootcamp = await BootcampModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // without this it updates but return the not updated item
      runValidators: true,
    });

    res.status(200).json({ sucess: true, updatedBootcamp });
  }
);

// @ desc     upload bootcamp photo
// @ route    PATCH /api/v1/bootcamp/:id/photo
// @ access   Private
export const uploadPhoto: RequestHandler = asyncHandler(
  async (req: ReqWithUser, res: Response, next: NextFunction) => {
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

      const bootcamp = await BootcampModel.findById(req.params.id);

      if (!bootcamp) {
        return next(new ErrorResponse('bootcamp does not exist', 400));
      }

      checkOwnerBeforeDbOperation(bootcamp, 'bootcamp', 'upload photo', req, next);

      const updatedBootcamp = await BootcampModel.findByIdAndUpdate(
        req.params.id,
        { photo: customFilename },
        { new: true }
      );

      res.status(200).json({ sucess: true, data: updatedBootcamp });
    });
  }
);

// * D
// @ desc     delete bootcamp
// @ route    DELETE /api/v1/bootcamp/:id
// @ access   Private
export const deleteBootcamp: RequestHandler = asyncHandler(
  async (req: ReqWithUser, res: Response, next: NextFunction) => {
    // ! findByIdAndDelete does not trigger pre `delete`
    // ! must use find then remove in order for `pre` to fire
    // const deletedBootcamp = await BootcampModel.findByIdAndDelete(req.params.id);
    const bootcamp = await BootcampModel.findById(req.params.id);

    if (!bootcamp) {
      return next(new ErrorResponse('bootcamp does not exist', 400));
    }

    checkOwnerBeforeDbOperation(bootcamp, 'bootcamp', 'delete', req, next);

    await bootcamp.remove();

    res.status(200).json({ sucess: true, data: bootcamp });
  }
);

// *
// @ desc     get bootcamp within certain radius
// @ route    GET /api/v1/bootcamp/radius/:zipcode/:distance
// @ access   Private
export const getBootcampsWithinRadius = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
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
  }
);
