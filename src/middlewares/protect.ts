import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
//
import { ErrorResponse } from '../helpers/ErrorResponse';
import { asyncHandler } from './async-handler';
import { UserModel, User } from '../models/User';

// interface ReqWithAuth extends Request {
// }

export interface ReqWithUser extends Request {
  user: User;
}

const getToken = (req: Request) => {
  let token: string | null = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // else if (req.cookies.token) {
  //   token = req.cookies.token
  // }

  return token;
};

export const protect = asyncHandler(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  const token = getToken(req);

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  const decodedJwt = jwt.verify(token, process.env.JWT_SECRET as string);

  try {
    const user = await UserModel.findById((decodedJwt as any).id);

    if (!user) {
      return next(new ErrorResponse('User does not exist', 400));
    }

    req.user = user;

    next();
  } catch (error) {
    return next(error);
  }
});
