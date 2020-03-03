import { Request, Response, NextFunction } from 'express';

import { ErrorResponse } from '../helpers/ErrorResponse';
import { asyncHandler } from '../middlewares/async-handler';
// import { ReqWithAdvancedResults } from '../middlewares/advanced-results';
import { UserModel } from '../models/User';
import { resSendJwt } from './auth.utils';
import { ReqWithUser } from '../middlewares/auth';
import { sendEmail } from '../helpers/send-email';

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

// * (ForgotPassword)
// @ desc     forgot password
// @ route    GET /api/v1/auth/forgot-password
// @ access   Public
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorResponse(`No user with email ${req.body.email}`, 400));
    }

    const resetToken = user.getResetToken();

    // saving hashed restPasswordToken
    await user.save({ validateBeforeSave: false }); // name, ... are not required

    const currentHost = req.get('host');
    const resetUrl = `${req.protocol}://${currentHost}/api/v1/auth/reset-password/${resetToken}`;
    const emailBody = `Please send PATCH request to url: ${resetUrl}`;

    try {
      await sendEmail({ email: user.email, subject: 'Subject', text: emailBody });
      res.status(200).send({ success: true, text: 'Email sent' });
    } catch (error) {
      user.resetPasswordExpire = undefined;
      user.resetPasswordToken = undefined;
      await user.save({ validateBeforeSave: false }); // so that reset info is not hanging
      return next(new ErrorResponse(`Something wrong happen while sending email`, 500));
    }
  }
);

// * R (Get My Info)
// @ desc     my-info
// @ route    GET /api/v1/auth/my-info
// @ access   Private
export const getMyInfo = asyncHandler((req: ReqWithUser, res: Response, next: NextFunction) => {
  console.log('req: ', req.user);
  res.status(200).send({ success: true, date: req.user });
});
