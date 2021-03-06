import { Request, Response, NextFunction, RequestHandler } from 'express';

export const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  return Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};
