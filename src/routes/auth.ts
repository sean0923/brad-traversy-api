import express from 'express';
//
import {
  signupNewUser,
  signin,
  getMyInfo,
  forgotPassword,
  resetPassword,
  updateMyInfo,
  updateMyPassword,
  signout,
} from '../controllers/auth';

import { protect } from '../middlewares/auth';

export const authRouter = express.Router();

// api/v1/auth/signup
authRouter.route('/signup-new-user').post(signupNewUser);

// api/v1/auth/signup
authRouter.route('/signin').post(signin);

authRouter.route('/signout').get(signout);

// api/v1/auth/signup
authRouter.route('/forgot-password').post(forgotPassword);

// api/v1/auth/reset-password/:resetPasswordToken
authRouter.route('/reset-password/:resetPasswordToken').patch(resetPassword);

// api/v1/auth/my-info
authRouter.route('/my-info').get(protect, getMyInfo as any);
authRouter.route('/update-my-info').patch(protect, updateMyInfo);
authRouter.route('/update-my-password').patch(protect, updateMyPassword);
