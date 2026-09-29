/**
 * Operational error with an HTTP status code. Throw it from controllers or
 * services and the global error handler turns it into a JSON response.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, details) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    if (details) this.details = details;
  }
}
