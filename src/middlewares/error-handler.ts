import { Response, Request, NextFunction } from 'express';
import { ErrorResponse } from '../helpers/ErrorResponse';
import { Error } from 'mongoose';
// const errrr: Error.

export const errorHandler = (
  err: ErrorResponse,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let tempErr = new ErrorResponse(err.message, err.statusCode);

  // MongoDB bad _id format
  if (err.name === 'CastError') {
    tempErr = new ErrorResponse(`Resource not found.`, 404);
  }

  // duplicate key error
  if (err.code === 11000 && err.keyValue) {
    tempErr = new ErrorResponse(`Duplication Err "key: ${JSON.stringify(err.keyValue)}"`, 400);
  }

  // validation err
  if (err.name === 'ValidationError' && err.errors) {
    const message = Object.values(err.errors)
      .map((obj) => obj.message)
      .join(', ');

    tempErr = new ErrorResponse(message, 404);
  }

  res.status(err.statusCode || 500).json({
    success: false,
    errorMessage: tempErr.message || 'error',
  });
};
