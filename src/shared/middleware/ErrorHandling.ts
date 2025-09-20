import { Request, Response, NextFunction } from 'express';
import { DomainError } from '@/domain/entities/DomainError';
import { ZodError } from 'zod';

interface ErrorResponse {
  error: string;
  message: string;
}

/**
 * Global error handler middleware for Express 5.1
 * Handles domain errors, validation errors, and unexpected errors
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let errorCode = 'InternalServerError';
  let message = 'An internal server error occurred';

  // Log error for debugging (suppress in test environment and user validation errors)
  if (process.env.NODE_ENV !== 'test' && !(error instanceof DomainError) && !(error instanceof ZodError)) {
    console.error(`[${new Date().toISOString()}] Error on ${req.method} ${req.path}:`, error);
  }

  if (error instanceof DomainError) {
    statusCode = 400;
    errorCode = error.code;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    errorCode = 'InvalidParameters';
    message = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
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

  // For development, include stack trace
  if (process.env.NODE_ENV === 'development') {
    (errorResponse as any).stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Not found handler for unknown routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    error: 'NotFound',
    message: `Route ${req.method} ${req.originalUrl} not found`
  };

  res.status(404).json(errorResponse);
};
