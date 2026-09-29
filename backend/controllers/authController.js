import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { AppError } from '../utils/AppError.js';
import { sendSuccess } from '../utils/helpers.js';
import { signToken } from '../services/tokenService.js';

const authPayload = async (user) => ({
  token: signToken(user),
  user,
  hasProfile: Boolean(await Profile.exists({ user: user._id })),
});

// POST /api/auth/register
export async function register(req, res) {
  const { name, email, password } = req.body;

  if (await User.exists({ email })) {
    throw new AppError('An account with this email already exists', 409);
  }
  // Role is never taken from the request body — new accounts are always "user".
  const user = await User.create({ name, email, password });
  sendSuccess(res, await authPayload(user), 201, 'Account created successfully');
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  // Same message for unknown email and wrong password — don't reveal which accounts exist.
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  sendSuccess(res, await authPayload(user), 200, 'Logged in successfully');
}

// GET /api/auth/me
export async function getMe(req, res) {
  sendSuccess(res, {
    user: req.user,
    hasProfile: Boolean(await Profile.exists({ user: req.user._id })),
  });
}

// POST /api/auth/logout — JWTs are stateless; the client discards its token.
export function logout(_req, res) {
  sendSuccess(res, null, 200, 'Logged out successfully');
}
