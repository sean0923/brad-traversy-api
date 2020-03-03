import { RequestHandler, Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middlewares/async-handler';
import { ResWithAdvanceResults } from '../middlewares/advanced-results';
import { ReqWithUser } from '../middlewares/auth';
import { UserModel } from '../models/User';
import { ErrorResponse } from '../helpers/ErrorResponse';

// * C
// @ desc     create new user
// @ route    POST /api/v1/users
// @ access   Private (admin only)
export const createUser = asyncHandler(
  async (req: ReqWithUser, res: Response, next: NextFunction) => {
    const { name, email, password, role } = req.body;

    const user = await UserModel.create({ name, email, password, role });

    res.status(201).json({ sucess: true, data: user });
  }
);

// * R
// @ desc     Get all users
// @ route    GET /api/v1/users
// @ access   Private (admin only)
export const getUsers = asyncHandler(
  async (req: ReqWithUser, res: ResWithAdvanceResults, next: NextFunction) => {
    res.status(200).json(res.advancedResults);
  }
);

// @ desc     Get a single user
// @ route    GET /api/v1/users/:id
// @ access   Private (admin only)
export const getUser: RequestHandler = asyncHandler(
  async (req: ReqWithUser, res: Response, next: NextFunction) => {
    const user = await UserModel.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse('user does not exsit', 400));
    }

    res.status(200).json({ sucess: true, data: user });
  }
);

// * U
// @ desc     update user
// @ route    PATCH /api/v1/user/:id
// @ access   Private (admin only)
export const updateUser = asyncHandler(
  async (req: ReqWithUser, res: Response, next: NextFunction) => {
    const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(new ErrorResponse('user does not exsit', 400));
    }

    res.status(200).json({ sucess: true, user });
  }
);

// * D
// @ desc     delete user
// @ route    DELETE /api/v1/users/:id
// @ access   Private (admin only)
export const deleteUser: RequestHandler = asyncHandler(
  async (req: ReqWithUser, res: Response, next: NextFunction) => {
    const user = await UserModel.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(new ErrorResponse('user does not exsit', 400));
    }

    res.status(200).json({ sucess: true, data: {} });
  }
);
