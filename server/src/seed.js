import 'dotenv/config';
import { connectDB } from './config/db.js';
import mongoose from 'mongoose';

import { User } from './models/User.js';
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

  console.log('[seed] ensuring admin user...');
  const email = 'admin@local.dev';
  let admin = await User.findOne({ email });
  if (!admin) {
    admin = new User({ email, name: 'Admin', role: 'admin' });
    await admin.setPassword('admin123');
    await admin.save();
    console.log(`  ✔ created ${email} / admin123`);
  } else {
    console.log(`  · ${email} already exists`);
  }

  console.log('[seed] ensuring demo dev/devops users...');
  const demos = [
    { email: 'dev@local.dev', name: 'Dev', role: 'dev', pass: 'dev123' },
    { email: 'devops@local.dev', name: 'DevOps', role: 'devops', pass: 'devops123' },
  ];
  for (const d of demos) {
    let u = await User.findOne({ email: d.email });
    if (!u) {
      u = new User({ email: d.email, name: d.name, role: d.role });
      await u.setPassword(d.pass);
      await u.save();
      console.log(`  ✔ created ${d.email} / ${d.pass} (${d.role})`);
    } else {
      console.log(`  · ${d.email} already exists`);
    }
  }

  console.log('[seed] done.');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
