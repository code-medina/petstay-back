import type { NextFunction, RequestHandler, Request, Response } from 'express';
import { AppError } from '../errors/app.error.js';
import { User } from '../models/user.model.js';

export const authorizeMiddleware = (roles: string[]): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // auth middleware attached user {id} of jwtpayload
    const userLocals = res.locals.user;
    if (!userLocals) return next(new AppError('user not defined', 401));

    const user = await User.findById(userLocals.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (!roles.includes(user.role)) {
      return next(new AppError('Forbidden: insufficient role', 403));
    }
    return next();
  };
};
