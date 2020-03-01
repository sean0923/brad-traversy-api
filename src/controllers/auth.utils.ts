import { Response } from 'express';
import * as dateFns from 'date-fns';
//
import { User } from '../models/User';

export const resSendJwt = (res: Response, user: User) => {
  const token = user.getJwtWithExpireTime();

  const option: any = {
    expires: Date.now(),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    option.secure = true;
  }

  const cookieExpireDays = parseInt(process.env.COOKIE_EXPIRE_DAYS as string);

  res
    .status(200)
    .cookie('token', token, {
      expires: dateFns.addDays(new Date(), cookieExpireDays),
      httpOnly: true,
      ...(process.env.NODE_ENV === 'production' && { secure: true }),
    })
    .json({ sucess: true, token, userId: user._id });
};
