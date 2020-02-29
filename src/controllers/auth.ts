import { Request, Response, NextFunction } from 'express';
// import { ErrorResponse } from '../helpers/ErrorResponse';
import { asyncHandler } from '../middlewares/async-handler';
// import { ReqWithAdvancedResults } from '../middlewares/advanced-results';
import { UserModel } from '../models/User';

// * C
// @ desc     signUp new user
// @ route    POST /api/v1/sign-up
// @ access   Public
export const signUpNewUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, role } = req.body;
    const user = await UserModel.create({ name, email, password, role });
    res.status(200).json({ sucess: true, data: user });
  }
);
