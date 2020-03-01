import express from 'express';
import { signupNewUser, signin } from '../controllers/auth';

export const authRouter = express.Router();

// api/v1/auth/signup
authRouter.route('/signup-new-user').post(signupNewUser);

authRouter.route('/signin').post(signin);
