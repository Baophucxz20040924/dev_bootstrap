import 'dotenv/config';
import { connectDB } from './config/db.js';
import mongoose from 'mongoose';

import { Module } from './models/Module.js';
import { ModuleVersion } from './models/ModuleVersion.js';
import { Project } from './models/Project.js';

import { MODULES } from './data/modules.js';
import { PROJECTS } from './data/manifests.js';

async function run() {
  await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/dev_bootstrap');

  console.log('[seed] clearing collections...');
  await Promise.all([Module.deleteMany({}), ModuleVersion.deleteMany({}), Project.deleteMany({})]);

  console.log('[seed] inserting modules...');
  for (const m of MODULES) {
    const { version, ...modDoc } = m;
    const mod = await Module.create(modDoc);
    await ModuleVersion.create({ module: mod._id, ...version });
    console.log(`  ✔ ${m.slug}`);
  }

  console.log('[seed] inserting projects...');
  for (const p of PROJECTS) {
    await Project.create(p);
    console.log(`  ✔ ${p.slug}`);
  }

  console.log('[seed] done.');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
