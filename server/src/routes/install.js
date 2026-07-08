import express from 'express';
import { Project } from '../models/Project.js';
import { resolveManifest, collectEnv } from '../generator/resolver.js';
import { generateBash } from '../generator/bash.js';
import { generatePowershell } from '../generator/powershell.js';

const router = express.Router();

async function findProject(slug) {
  return Project.findOne({ slug: slug.toLowerCase() }).lean();
}

async function buildScript(req, flavor, res) {
  const project = await findProject(req.params.slug);
  if (!project) return res.status(404).type('text/plain').send(`# project not found: ${req.params.slug}\n`);

  if (project.enabled === false) {
    const msg = `Project dang bao tri. Vui long thu lai sau.`;
    const body = flavor === 'powershell'
      ? `# ${msg}\nWrite-Host '${msg}' -ForegroundColor Yellow\nexit 1\n`
      : `# ${msg}\necho '${msg}' >&2\nexit 1\n`;
    return res.status(503).type('text/plain').send(body);
  }

  const { resolved, missing } = await resolveManifest(project.steps || []);
  if (!resolved.length) {
    return res
      .status(422)
      .type('text/plain')
      .send(`# nothing to install for "${req.params.slug}". missing: ${missing.join(', ')}\n`);
  }

  const payload = { manifest: project, resolved };
  const script = flavor === 'powershell' ? generatePowershell(payload) : generateBash(payload);

  res.type('text/plain');
  if (missing.length) res.set('X-Missing-Modules', missing.join(','));
  return res.send(script);
}

// Default flavor = bash (used by `curl ... | bash`)
router.get('/:slug', (req, res) => buildScript(req, 'bash', res));
router.get('/:slug/bash', (req, res) => buildScript(req, 'bash', res));
router.get('/:slug/powershell', (req, res) => buildScript(req, 'powershell', res));
router.get('/:slug/windows', (req, res) => buildScript(req, 'powershell', res));

// JSON preview for the web UI.
router.get('/:slug/preview.json', async (req, res) => {
  const project = await findProject(req.params.slug);
  if (!project) return res.status(404).json({ error: 'project not found' });
  if (project.enabled === false) {
    return res.status(503).json({ error: 'maintenance', maintenance: true, manifest: { name: project.name, slug: project.slug } });
  }

  const { resolved, missing } = await resolveManifest(project.steps || []);
  const payload = { manifest: project, resolved };
  const env = collectEnv(resolved);

  res.json({
    manifest: project,
    steps: resolved.map(({ module, version }) => ({
      slug: module.slug,
      name: module.name,
      category: module.category,
      version: version.version,
    })),
    env: Object.entries(env).map(([key, meta]) => ({
      key,
      required: !!meta.required,
      prompt: meta.prompt || '',
      default: meta.default ?? '',
    })),
    missing,
    bash: resolved.length ? generateBash(payload) : '',
    powershell: resolved.length ? generatePowershell(payload) : '',
  });
});

export default router;
