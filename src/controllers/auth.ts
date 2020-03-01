import { Request, Response, NextFunction } from 'express';
import * as dateFns from 'date-fns';

import { ErrorResponse } from '../helpers/ErrorResponse';
import { asyncHandler } from '../middlewares/async-handler';
// import { ReqWithAdvancedResults } from '../middlewares/advanced-results';
import { UserModel, User } from '../models/User';

// * C (Sign Up)
// @ desc     signUp new user
// @ route    POST /api/v1/auth/signup-new-user
// @ access   Public
export const signupNewUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, role } = req.body;
    const user = await UserModel.create({ name, email, password, role });
    const token = user.getJwtWithExpireTime();

    res.status(200).json({ sucess: true, token });
  }
);

// * C (Sign In)
// @ desc     signin
// @ route    POST /api/v1/auth/signin
// @ access   Public
export const signin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email }).select('password'); // select password because in schema level select password false

  if (!user) {
    return next(new ErrorResponse('Invalid user credentials', 400));
  }

  const isCorrectPassword = await user.checkPassword(password);

  if (!isCorrectPassword) {
    return next(new ErrorResponse('Invalid user credentials', 400));
  }

  resSendJwt(res, user);
});

const resSendJwt = (res: Response, user: User) => {
  const token = user.getJwtWithExpireTime();

  const option: any = {
    expires: Date.now(),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    option.secure = true;
  }

  const cookieExpireDays = parseInt(process.env.COOKIE_EXPIRE_DAYS as string);

  res
    .status(200)
    .cookie('token', token, {
      expires: dateFns.addDays(new Date(), cookieExpireDays),
      httpOnly: true,
      ...(process.env.NODE_ENV === 'production' && { secure: true }),
    })
    .json({ sucess: true, token });
};
