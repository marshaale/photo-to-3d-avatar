import { AppError } from '@/utils';
import type { NextFunction, Request, Response } from 'express';

export function notFoundHandler(
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  res.status(404).json({ message: 'Resource not found' });
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message, code: err.code });
  } else {
    res.status(500).json({ message: 'Internal server error' });
  }
}
