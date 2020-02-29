import { Request, Response, NextFunction } from 'express';
// import { ErrorResponse } from '../helpers/ErrorResponse';
import { asyncHandler } from '../middlewares/async-handler';
// import { ReqWithAdvancedResults } from '../middlewares/advanced-results';

// * C
// @ desc     signUp new user
// @ route    POST /api/v1/sign-up
// @ access   Public
export const signUpNewUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ sucess: true });
  }
);
