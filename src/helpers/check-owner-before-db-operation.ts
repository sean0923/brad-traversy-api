import { ReqWithUser } from '../middlewares/auth';
import { NextFunction } from 'express';
import { ErrorResponse } from './ErrorResponse';
import mongoose from 'mongoose';

interface MustHaveKey_userId {
  userId: mongoose.Types.ObjectId;
  [key: string]: any;
}

export function checkOwnerBeforeDbOperation(
  instance: MustHaveKey_userId | null,
  instanceName: 'bootcamp' | 'course' | 'review',
  dbOperationName: 'update' | 'upload photo' | 'delete' | 'create',
  req: ReqWithUser,
  next: NextFunction
) {
  if (!instance) {
    return next(new ErrorResponse(`No instance!!!`, 400));
  }

  const notOwner = instance.userId.toString() !== req.user.id;
  const notAdmin = req.user.role !== 'admin';

  if (notOwner && notAdmin) {
    return next(
      new ErrorResponse(
        `User id: ${req.user.id} is not authorized to ${dbOperationName} this ${instanceName}`,
        401
      )
    );
  }
}
