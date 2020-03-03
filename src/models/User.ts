import crypto from 'crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as dateFns from 'date-fns';

// assigning admin is only possible through db UI
type Role = 'user' | 'publisher' | 'admin';

export interface User extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  resetPasswordToken: string | undefined;
  resetPasswordExpire: Date | undefined;
  createdAt: Date;
  //
  getJwtWithExpireTime: () => string;
  checkPassword: (password: string) => Promise<boolean>;
  getResetPasswordToken: () => string;
}

// interface Method {
//   getJwtWithExpireTime: () => string;
// }

const emialRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

const UserSchema = new mongoose.Schema<User>({
  name: { type: String, required: [true, 'Please add a name'] },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [emialRegex, 'Please add valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false, // select false to not return password to client
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user',
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre<User>('save', async function(next) {
  if (!this.password) {
    next(); // for forgot password
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;

  next();
});

UserSchema.methods.getJwtWithExpireTime = function() {
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

UserSchema.methods.checkPassword = function(enteredPassword: string) {
  return bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getResetPasswordToken = function() {
  const resetPasswordToken = crypto.randomBytes(20).toString('hex');

  const hashedResetToken = crypto
    .createHash('sha256')
    .update(resetPasswordToken)
    .digest('hex');

  this.resetPasswordToken = hashedResetToken;
  this.resetPasswordExpire = dateFns.addMinutes(new Date(), 10);

  return resetPasswordToken;
};

export const UserModel = mongoose.model<User>('User', UserSchema);
