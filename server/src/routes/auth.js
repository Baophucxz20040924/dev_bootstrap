import express from 'express';
import { User } from '../models/User.js';
import { signToken, authRequired } from '../middleware/auth.js';

const router = express.Router();

// Public self-registration is disabled: only an admin can create users
// (via /api/users). Kept as an explicit 403 so old clients get a clear message.
router.post('/register', (_req, res) => {
  res.status(403).json({ error: 'registration disabled — liên hệ admin để tạo tài khoản' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.verifyPassword(password))) {
    return res.status(401).json({ error: 'invalid credentials' });
  }
  return res.json({ user, token: signToken(user) });
});

router.get('/me', authRequired, (req, res) => {
  res.json({ user: req.user });
});

export default router;
