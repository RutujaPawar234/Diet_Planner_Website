import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

/**
 * Runs an array of express-validator chains and stops the request with
 * 422 Unprocessable Entity if any of them fail.
 */
export const validate = (chains) => async (req, _res, next) => {
  for (const chain of chains) await chain.run(req);

  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const details = result.array().map((err) => ({ field: err.path, message: err.msg }));
  throw new AppError(details[0].message, 422, details);
};
