import { Request, Response, NextFunction } from 'express';
import { DomainError } from '@/domain/entities/DomainError';
import { ZodError } from 'zod';

interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
  timestamp?: string;
  path?: string;
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let errorCode = 'InternalServerError';
  let message = 'An internal server error occurred';

  if (error instanceof DomainError) {
    statusCode = 400;
    errorCode = error.code;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    errorCode = 'InvalidParameters';
    message = error.issues[0]?.message || 'Invalid input parameters';
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'InvalidParameters';
    message = error.message;
  } else if (error.message.includes('ENOTFOUND') || error.message.includes('Network')) {
    statusCode = 503;
    errorCode = 'ServiceUnavailable';
    message = 'External service temporarily unavailable';
  }

  const errorResponse: ErrorResponse = {
    error: errorCode,
    message
  };

  res.status(statusCode).json(errorResponse);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    error: 'NotFound',
    message: `Route ${req.method} ${req.path} not found`
  };

  res.status(404).json(errorResponse);
};
