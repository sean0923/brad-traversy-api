import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../helpers/ErrorResponse';
import { asyncHandler } from '../middlewares/async-handler';
// import { ReqWithAdvancedResults } from '../middlewares/advanced-results';
import { UserModel } from '../models/User';

// * C (Sign Up)
// @ desc     signUp new user
// @ route    POST /api/v1/auth/signup-new-user
// @ access   Public
export const signupNewUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, role } = req.body;
    const user = await UserModel.create({ name, email, password, role });
    const token = user.getJwtToken();

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

  const token = user.getJwtToken();

  res.status(200).json({ sucess: true, token });
});
