import { Module } from '../models/Module.js';
import { ModuleVersion } from '../models/ModuleVersion.js';

/**
 * Resolve a manifest's steps into concrete module + version documents.
 * Returns { resolved: [{ module, version, steps }], missing: [slug] }.
 */
export async function resolveManifest(steps) {
  const resolved = [];
  const missing = [];

  for (const step of steps) {
    const mod = await Module.findOne({ slug: step.moduleSlug }).lean();
    if (!mod) {
      missing.push(step.moduleSlug);
      continue;
    }

    const wanted = !step.version || step.version === 'default' ? mod.defaultVersion : step.version;
    let mv = await ModuleVersion.findOne({ module: mod._id, version: wanted }).lean();

    // Fall back to any version so a manifest never silently drops a module.
    if (!mv) {
      mv = await ModuleVersion.findOne({ module: mod._id }).sort({ createdAt: -1 }).lean();
    }
    if (!mv) {
      missing.push(`${step.moduleSlug}@${wanted}`);
      continue;
    }

    resolved.push({ module: mod, version: mv });
  }

  return { resolved, missing };
}

/** Collect declared env vars across all resolved module versions. */
export function collectEnv(resolved) {
  const env = {};
  for (const { version } of resolved) {
    const map = version.env || {};
    // lean() turns Map into a plain object
    for (const [key, meta] of Object.entries(map)) {
      // Keep the strictest requirement if a key appears twice.
      if (!env[key] || meta?.required) env[key] = meta || { required: false, prompt: '' };
    }
  }
  return env;
}
