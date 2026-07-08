import express from 'express';
import { Module } from '../models/Module.js';
import { ModuleVersion } from '../models/ModuleVersion.js';
import { authRequired, requireRole } from '../middleware/auth.js';

const router = express.Router();
const admin = [authRequired, requireRole('admin')];

// List modules (public read) with their versions.
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  const modules = await Module.find(filter).sort({ slug: 1 }).lean();
  const withVersions = await Promise.all(
    modules.map(async (m) => {
      const versions = await ModuleVersion.find({ module: m._id }).sort({ createdAt: 1 }).lean();
      return { ...m, versions };
    })
  );
  res.json(withVersions);
});

router.get('/:slug', async (req, res) => {
  const mod = await Module.findOne({ slug: req.params.slug.toLowerCase() }).lean();
  if (!mod) return res.status(404).json({ error: 'module not found' });
  const versions = await ModuleVersion.find({ module: mod._id }).sort({ createdAt: 1 }).lean();
  res.json({ ...mod, versions });
});

router.post('/', ...admin, async (req, res) => {
  const { slug, name, description, category, tags, defaultVersion } = req.body || {};
  if (!slug || !name) return res.status(400).json({ error: 'slug and name required' });
  const exists = await Module.findOne({ slug: slug.toLowerCase() });
  if (exists) return res.status(409).json({ error: 'slug already exists' });
  const mod = await Module.create({ slug, name, description, category, tags, defaultVersion });
  res.status(201).json(mod);
});

router.put('/:slug', ...admin, async (req, res) => {
  const { name, description, category, tags, defaultVersion } = req.body || {};
  const mod = await Module.findOneAndUpdate(
    { slug: req.params.slug.toLowerCase() },
    { name, description, category, tags, defaultVersion },
    { new: true }
  );
  if (!mod) return res.status(404).json({ error: 'module not found' });
  res.json(mod);
});

router.delete('/:slug', ...admin, async (req, res) => {
  const mod = await Module.findOne({ slug: req.params.slug.toLowerCase() });
  if (!mod) return res.status(404).json({ error: 'module not found' });
  await ModuleVersion.deleteMany({ module: mod._id });
  await mod.deleteOne();
  res.json({ ok: true });
});

// ---- Versions ----
router.post('/:slug/versions', ...admin, async (req, res) => {
  const mod = await Module.findOne({ slug: req.params.slug.toLowerCase() });
  if (!mod) return res.status(404).json({ error: 'module not found' });
  const { version, channel, env, bash, powershell } = req.body || {};
  if (!version) return res.status(400).json({ error: 'version required' });
  const exists = await ModuleVersion.findOne({ module: mod._id, version });
  if (exists) return res.status(409).json({ error: 'version already exists' });
  const mv = await ModuleVersion.create({ module: mod._id, version, channel, env, bash, powershell });
  res.status(201).json(mv);
});

router.put('/:slug/versions/:version', ...admin, async (req, res) => {
  const mod = await Module.findOne({ slug: req.params.slug.toLowerCase() });
  if (!mod) return res.status(404).json({ error: 'module not found' });
  const { channel, env, bash, powershell } = req.body || {};
  const mv = await ModuleVersion.findOneAndUpdate(
    { module: mod._id, version: req.params.version },
    { channel, env, bash, powershell },
    { new: true }
  );
  if (!mv) return res.status(404).json({ error: 'version not found' });
  res.json(mv);
});

router.delete('/:slug/versions/:version', ...admin, async (req, res) => {
  const mod = await Module.findOne({ slug: req.params.slug.toLowerCase() });
  if (!mod) return res.status(404).json({ error: 'module not found' });
  const r = await ModuleVersion.deleteOne({ module: mod._id, version: req.params.version });
  if (!r.deletedCount) return res.status(404).json({ error: 'version not found' });
  res.json({ ok: true });
});

export default router;
