import { Request, Response, NextFunction } from 'express';

import { ErrorResponse } from '../helpers/ErrorResponse';
import { asyncHandler } from '../middlewares/async-handler';
// import { ReqWithAdvancedResults } from '../middlewares/advanced-results';
import { UserModel } from '../models/User';
import { resSendJwt } from './auth.utils';
import { ReqWithUser } from '../middlewares/auth';
import { sendEmail } from '../helpers/send-email';
import crypto from 'crypto';

// * C (Sign Up)
// @ desc     signUp new user
// @ route    POST /api/v1/auth/signup-new-user
// @ access   Public
export const signupNewUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, role } = req.body;
    const user = await UserModel.create({ name, email, password, role });

    resSendJwt(res, user);
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

// * C (C for creating resetPasswordToken) (ForgotPassword)
// @ desc     forgot password
// @ route    POST /api/v1/auth/forgot-password
// @ access   Public
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorResponse(`No user with email ${req.body.email}`, 400));
    }

    const resetPasswordToken = user.getResetPasswordToken();

    // saving hashed restPasswordToken
    await user.save({ validateBeforeSave: false }); // name, ... are not required

    const currentHost = req.get('host');
    const resetUrl = `${req.protocol}://${currentHost}/api/v1/auth/reset-password/${resetPasswordToken}`;
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
// export const getMyInfo = asyncHandler((req: ReqWithUser, res: Response, next: NextFunction) => {
//   res.status(200).send({ success: true, date: req.user });
// });

export const getMyInfo = (req: ReqWithUser, res: Response, next: NextFunction) => {
  res.status(200).send({ success: true, date: req.user });
};

// * U (Reset password)
// @ desc     forgot password
// @ route    PATCH /api/v1/auth/reset-password/:resetPasswordToken
// @ access   Public
export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { resetPasswordToken } = req.params;
    const hasedResetPasswordToken = crypto
      .createHash('sha256')
      .update(resetPasswordToken)
      .digest('hex');

    const user = await UserModel.findOne({ resetPasswordToken: hasedResetPasswordToken });

    if (!user) {
      return next(new ErrorResponse('Invalid resetPasswordToken', 400));
    }

    const { newPassword } = req.body;

    user.password = newPassword;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save();

    resSendJwt(res, user);
  }
);
