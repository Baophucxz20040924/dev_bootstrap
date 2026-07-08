import express from 'express';
import { User } from '../models/User.js';
import { authRequired, requireRole } from '../middleware/auth.js';

const router = express.Router();
const ROLES = ['admin', 'dev', 'devops'];

// All user-management endpoints are admin-only.
router.use(authRequired, requireRole('admin'));

router.get('/', async (_req, res) => {
  const users = await User.find().sort({ createdAt: 1 });
  res.json(users);
});

router.post('/', async (req, res) => {
  const { email, name, password, role } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  if (role && !ROLES.includes(role)) return res.status(400).json({ error: 'invalid role' });
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ error: 'email already registered' });
  const user = new User({ email, name, role: role || 'dev' });
  await user.setPassword(password);
  await user.save();
  res.status(201).json(user);
});

router.put('/:id', async (req, res) => {
  const { name, role, password } = req.body || {};
  if (role && !ROLES.includes(role)) return res.status(400).json({ error: 'invalid role' });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'user not found' });

  // Don't allow demoting the last remaining admin.
  if (role && role !== 'admin' && user.role === 'admin') {
    const admins = await User.countDocuments({ role: 'admin' });
    if (admins <= 1) return res.status(400).json({ error: 'không thể hạ quyền admin cuối cùng' });
  }

  if (name !== undefined) user.name = name;
  if (role) user.role = role;
  if (password) await user.setPassword(password);
  await user.save();
  res.json(user);
});

router.delete('/:id', async (req, res) => {
  if (String(req.user._id) === req.params.id) {
    return res.status(400).json({ error: 'không thể tự xóa chính mình' });
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'user not found' });
  if (user.role === 'admin') {
    const admins = await User.countDocuments({ role: 'admin' });
    if (admins <= 1) return res.status(400).json({ error: 'không thể xóa admin cuối cùng' });
  }
  await user.deleteOne();
  res.json({ ok: true });
});

export default router;
