import mongoose from 'mongoose';
import slugify from 'slugify';
import { geocode } from '../helpers/geocode';

type Role = 'user' | 'publisher';

interface User extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  resetPasswordToken: string;
  resetPasswordExpire: Date;
  createdAt: Date;
}

const BootcampSchema = new mongoose.Schema<User>({
  name: { type: String, required: [true, 'Please add a name'] },
  email: { type: String, required: [true, 'Please add an email'], unique: true },
  password: { type: String, required: [true, 'Please add a password'], select: false },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const BootcampModel = mongoose.model<User>('Bootcamp', BootcampSchema);
