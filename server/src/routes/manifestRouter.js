import express from 'express';
import { authRequired, optionalAuth, requireRole, canView } from '../middleware/auth.js';

// Projects and Profiles are structurally identical manifests.
// This factory builds a CRUD router for either model.
export function manifestRouter(Model) {
  const router = express.Router();

  // Public list, filtered by the caller's role (anonymous = dev-level view).
  router.get('/', optionalAuth, async (req, res) => {
    const role = req.user?.role || null;
    const items = await Model.find().sort({ slug: 1 }).lean();
    res.json(items.filter((p) => canView(p, role)));
  });

  router.get('/:slug', optionalAuth, async (req, res) => {
    const item = await Model.findOne({ slug: req.params.slug.toLowerCase() }).lean();
    if (!item) return res.status(404).json({ error: 'not found' });
    if (!canView(item, req.user?.role || null)) return res.status(403).json({ error: 'forbidden' });
    res.json(item);
  });

  router.post('/', authRequired, requireRole('admin'), async (req, res) => {
    const { slug, name, description, guide, version, steps, enabled, allowedRoles, installPath } = req.body || {};
    if (!slug || !name) return res.status(400).json({ error: 'slug and name required' });
    const exists = await Model.findOne({ slug: slug.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'slug already exists' });
    const item = await Model.create({ slug, name, description, guide, version, steps, enabled, allowedRoles, installPath });
    res.status(201).json(item);
  });

  router.put('/:slug', authRequired, requireRole('admin'), async (req, res) => {
    const { name, description, guide, version, steps, enabled, allowedRoles, installPath } = req.body || {};
    const update = { name, description, guide, version, steps };
    if (enabled !== undefined) update.enabled = enabled;
    if (allowedRoles !== undefined) update.allowedRoles = allowedRoles;
    if (installPath !== undefined) update.installPath = installPath;
    const item = await Model.findOneAndUpdate({ slug: req.params.slug.toLowerCase() }, update, { new: true });
    if (!item) return res.status(404).json({ error: 'not found' });
    res.json(item);
  });

  router.delete('/:slug', authRequired, requireRole('admin'), async (req, res) => {
    const r = await Model.deleteOne({ slug: req.params.slug.toLowerCase() });
    if (!r.deletedCount) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  });

  return router;
}
