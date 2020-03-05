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
  let token: string | undefined = undefined;

  // * Bearer token only
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // // * if Bearere token does not exist then set token from cookie.token
  // if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
  //   token = req.headers.authorization.split(' ')[1];
  // } else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  return token;
};

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = getToken(req);

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  const decodedJwt = jwt.verify(token, process.env.JWT_SECRET as string);

  try {
    const user = await UserModel.findById((decodedJwt as any).id).select('+password');

    if (!user) {
      return next(new ErrorResponse('User does not exist', 400));
    }

    // from this line user will be available at req
    // in otherwords, req.user will be availble for all protected routes
    (req as any).user = user;
    // req as any because before this line user should not be available

    next();
  } catch (error) {
    return next(error);
  }
});

export const authorize = (...roles: string[]) => (
  req: ReqWithUser,
  res: Response,
  next: NextFunction
) => {
  console.log('req.user.role: ', req.user.role);
  const isAuthorized = roles.includes(req.user.role);

  if (!isAuthorized) {
    return next(
      new ErrorResponse(`user role ${req.user.role} is not authorize to perform this action`, 403)
    );
  }

  next();
};
