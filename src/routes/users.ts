import express from 'express';

import { advancedResults } from '../middlewares/advanced-results';
import { protect, authorize } from '../middlewares/auth';
import { UserModel } from '../models/User';
import { getUsers, createUser, getUser, updateUser, deleteUser } from '../controllers/users';

export const usersRouter = express.Router();

// * this way, protect and authorize is applied to all router below ---------
usersRouter.use(protect);
usersRouter.use(authorize('admin') as any);
// * ------------------------------------------------------------------------

usersRouter
  .route('/')
  .get(advancedResults(UserModel, 'users') as any, getUsers)
  .post(createUser);

usersRouter
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);
