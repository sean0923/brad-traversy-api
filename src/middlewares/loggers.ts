import { RequestHandler } from 'express';

export const logger: RequestHandler = (req, res, next) => {
  console.log(`${req.method} ${req.protocol}:${req.get('host')} ${req.originalUrl}`);
  next();
};
