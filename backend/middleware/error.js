import { env } from '../config/env.js';

/** 404 for any /api route that no router handled. */
export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

/**
 * Global error handler — converts every thrown error (AppError, Mongoose,
 * JWT, JSON parsing) into a consistent JSON response with a proper status code.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  } else if (err.name === 'ValidationError') {
    statusCode = 422;
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    message = details[0]?.message || 'Validation failed';
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists`;
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = err.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid token';
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  }

  if (statusCode >= 500) {
    console.error(err);
    if (env.isProduction) message = 'Something went wrong. Please try again later.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
    ...(!env.isProduction && statusCode >= 500 && { stack: err.stack }),
  });
}
