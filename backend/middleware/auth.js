import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { verifyToken } from '../services/tokenService.js';

/**
 * Authentication: requires a valid "Authorization: Bearer <jwt>" header
 * and attaches the current user document to req.user.
 */
export async function protect(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Authentication required. Please log in.', 401);
  }

  const payload = verifyToken(token); // throws JsonWebTokenError / TokenExpiredError
  const user = await User.findById(payload.id);
  if (!user) throw new AppError('The account for this token no longer exists.', 401);

  req.user = user;
  next();
}

/**
 * Authorization: only lets the listed roles through. Use after protect().
 *   router.post('/', protect, authorize('admin'), handler)
 */
export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action.', 403);
    }
    next();
  };
