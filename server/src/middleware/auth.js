import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export function signToken(user) {
  return jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// Attaches req.user when a valid Bearer token is present.
export async function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Like authRequired but never rejects: sets req.user (or null) and continues.
// Used by public GETs that still want to know the caller's role for filtering.
export async function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  req.user = null;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(payload.sub);
    } catch {
      req.user = null;
    }
  }
  next();
}

// Guard for admin-only (or other role-restricted) routes. Run after authRequired.
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'forbidden' });
    }
    next();
  };
}

// Can a caller with `role` (null = anonymous) see this project?
// admin + devops see everything; dev/anonymous only if 'dev' is allowed.
export function canView(project, role) {
  if (role === 'admin' || role === 'devops') return true;
  return (project.allowedRoles || []).includes('dev');
}
