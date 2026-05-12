import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';

import type { IUser } from '../models/user.model.js';

export const generateToken = (user: IUser) => {
  const secret = process.env.SECRET_ACCESS_TOKEN!;
  const expiresIn=process.env.JWT_ACCESS_EXPIRES! as StringValue;

  const options: jwt.SignOptions = { expiresIn };
  return jwt.sign({ _id: user._id }, secret, options);
};
export const generateRefreshToken = (user: IUser) => {
  const expiresIn=process.env.JWT_REFRESH_EXPIRES! as StringValue;

  const secret = process.env.SECRET_REFRESH_TOKEN!;

  const options: jwt.SignOptions = { expiresIn };
  return jwt.sign({ _id: user._id }, secret, options);
};
