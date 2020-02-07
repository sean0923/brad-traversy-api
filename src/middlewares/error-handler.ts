import { Response } from 'express';
import { ErrorResponse } from '../helpers/ErrorResponse';

export const errorHandler = (err: ErrorResponse, req, res: Response, next) => {
  let tempErr = { ...err };
  console.log(err.stack?.red);

  // MongoDB bad _id format
  if (err.name === 'CastError') {
    tempErr = new ErrorResponse(`Bootcamp not found with id of ${(err as any).value}`, 404);
  }

  res.status(err.statusCode || 500).json({
    success: false,
    errorMessage: tempErr.message || 'error',
  });
};
