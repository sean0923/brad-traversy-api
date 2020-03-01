import express from 'express';
//
import { signupNewUser, signin, getMyInfo } from '../controllers/auth';
import { protect } from '../middlewares/protect';

export const authRouter = express.Router();

// api/v1/auth/signup
authRouter.route('/signup-new-user').post(signupNewUser);

authRouter.route('/signin').post(signin);

authRouter.route('/my-info').get(protect, getMyInfo);
