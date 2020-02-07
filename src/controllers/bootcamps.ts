import { RequestHandler, Request } from 'express';
import { BootcampModel } from '../models/Bootcamp';
import { ErrorResponse } from '../helpers/ErrorResponse';

// * C
// @ desc     create new bootcamp
// @ route    POST /api/v1/bootcamp
// @ access   Private
export const createBootcamp: RequestHandler = async (req, res, next) => {
  try {
    const bootcamp = await BootcampModel.create(req.body);
    // 201 for creation
    res.status(201).json({ sucess: true, data: bootcamp });
  } catch (error) {
    res.status(400).json({ sucess: false, errMsg: error.errmsg });
  }
};

// * R
// @ desc     Get all bootcamps
// @ route    GET /api/v1/bootcamps
// @ access   Public
export const getBootcamps: RequestHandler = async (req, res, next) => {
  try {
    const allBootcamps = await BootcampModel.find();
    res.status(200).json({ sucess: true, count: allBootcamps.length, data: allBootcamps });
  } catch (error) {
    res.status(400).json({ sucess: false, errMsg: error.errmsg });
  }
};

// @ desc     Get a single bootcamp
// @ route    GET /api/v1/bootcamp/:id
// @ access   Public
export const getBootcamp: RequestHandler = async (req: Request, res, next) => {
  try {
    const singleBootcamp = await BootcampModel.findById(req.params.id);
    if (!singleBootcamp) {
      return res.status(400).json({ sucess: false, errMsg: 'bootcamp does not exsit' });
    }
    res.status(200).json({ sucess: true, data: singleBootcamp });
  } catch (error) {
    // res.status(400).json({ sucess: false, errMsg: error.message });
    // next(new ErrorResponse('Wrong format of bootcamp id', 404));
    next(error);
  }
};

// * U
// @ desc     update bootcamp
// @ route    PUT /api/v1/bootcamp/:id
// @ access   Private
export const updateBootcamp: RequestHandler = async (req, res, next) => {
  try {
    const updatedBootcamp = await BootcampModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // without this it updates but return the not updated item
      runValidators: true,
    });
    if (!updatedBootcamp) {
      return res.status(400).json({ sucess: false, errMsg: 'bootcamp does not exsit' });
    }
    res.status(200).json({ sucess: true, data: updatedBootcamp });
  } catch (error) {
    res.status(400).json({ sucess: false, errMsg: error.message });
  }
};

// * D
// @ desc     delete bootcamp
// @ route    DELETE /api/v1/bootcamp/:id
// @ access   Private
export const deleteBootcamp: RequestHandler = async (req, res, next) => {
  try {
    const deletedBootcamp = await BootcampModel.findByIdAndDelete(req.params.id);
    if (!deletedBootcamp) {
      return res.status(400).json({ sucess: false, errMsg: 'bootcamp does not exsit' });
    }
    res.status(200).json({ sucess: true, data: deletedBootcamp });
  } catch (error) {
    res.status(400).json({ sucess: false, errMsg: error.message });
  }
};
