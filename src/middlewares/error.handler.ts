import { logger } from '../lib/logger.js';
import { AppError } from '../errors/app.error.js';
import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from 'express';

export const errorHandler: ErrorRequestHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.info(error.stack);
  logger.error(error);
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  return res.status(statusCode).json({ ok: false, message });
};
