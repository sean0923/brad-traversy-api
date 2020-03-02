import express from 'express';
//
import { signupNewUser, signin, getMyInfo, forgotPassword } from '../controllers/auth';
import { protect } from '../middlewares/auth';

export const authRouter = express.Router();

// api/v1/auth/signup
authRouter.route('/signup-new-user').post(signupNewUser);

// api/v1/auth/signup
authRouter.route('/signin').post(signin);

// api/v1/auth/signup
authRouter.route('/forgot-password').post(forgotPassword);

authRouter.route('/my-info').get(protect, getMyInfo);
