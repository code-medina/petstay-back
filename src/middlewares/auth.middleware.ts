import type { RequestHandler, Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app.error.js';
import { verifyToken } from '../lib/jwt.js';
import { logger } from '../lib/logger.js';

//because comman js
import jwt from 'jsonwebtoken';
const { JsonWebTokenError,TokenExpiredError } = jwt;


export const authMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.info('auth middleware');
  const accessToken = req.signedCookies['access_token'];

  if (!accessToken)
    return next(new AppError('Access token is not defined', 401));

  try {
    const payload = verifyToken(accessToken);
    if (!payload) {
      res.locals.user = null;
      return next(new AppError('Invalid access token', 401));
    }
    res.locals.user = {
      id: payload.sub,
    };
    return next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return next(new AppError('Token expired', 401));
    }

    if (error instanceof JsonWebTokenError) {
      return next(new AppError('Invalid token', 401));
    }
    return next(error);
  }
};
