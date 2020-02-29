import express from 'express';
import { signUpNewUser } from '../controllers/auth';

export const authRouter = express.Router();

// api/v1/auth/
authRouter.route('/').post(signUpNewUser);
