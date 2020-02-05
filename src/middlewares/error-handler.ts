import { Response } from 'express';

export const errorHandler = (err, req, res: Response, next) => {
  console.log(err.stack.red);

  res.status(400).json({
    success: false,
    errMsg: err.message,
  });
};
