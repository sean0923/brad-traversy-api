import { Response } from 'express';
import { ErrorResponse } from '../helpers/ErrorResponse';

export const errorHandler = (err: ErrorResponse, req, res: Response, next) => {
  console.log(err.stack?.red);

  res.status(err.statusCode).json({
    success: false,
    errorMessage: err.message,
  });
};
