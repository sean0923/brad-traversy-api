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
  instanceName: 'bootcamp' | 'course',
  dbOperationName: 'update' | 'upload photo' | 'delete',
  req: ReqWithUser,
  next: NextFunction
) {
  const notOwner = (instance as any).userId.toString() !== req.user.id;
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
