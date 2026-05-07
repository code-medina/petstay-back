import jwt from 'jsonwebtoken';
import type { IUser } from '../models/user.model.js';

export const generateToken = (user: IUser) => {
  const secret = process.env.SECRET_ACCESS_TOKEN!;

  const options: jwt.SignOptions = { expiresIn: '1h' };
  return jwt.sign({ _id: user._id }, secret, options);
};
export const generateRefreshToken = (user: IUser) => {
  const secret = process.env.SECRET_REFRESH_TOKEN!;

  const options: jwt.SignOptions = { expiresIn: '1d' };
  return jwt.sign({ _id: user._id }, secret, options);
};
