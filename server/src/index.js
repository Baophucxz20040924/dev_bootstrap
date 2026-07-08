import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { connectDB } from './config/db.js';
import { Project } from './models/Project.js';

import authRoutes from './routes/auth.js';
import moduleRoutes from './routes/modules.js';
import userRoutes from './routes/users.js';
import installRoutes from './routes/install.js';
import binRoutes from './routes/bin.js';
import { manifestRouter } from './routes/manifestRouter.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json({ limit: '1mb' }));

// Request logging (lightweight)
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/health', (_req, res) => res.json({ ok: true, service: 'dev-bootstrap' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/projects', manifestRouter(Project));

// Public install/script-generation endpoints (also served under /install for the
// one-line `curl` UX described in the spec).
app.use('/api/install', installRoutes);
app.use('/install', installRoutes);

// Hosted binaries (e.g. the devsecops CLI) that install scripts download.
app.use('/bin', binRoutes);

// 404 + error handlers
app.use((req, res) => res.status(404).json({ error: 'route not found', path: req.url }));
app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  res.status(500).json({ error: 'internal error', detail: err.message });
});

const PORT = process.env.PORT || 4000;
const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dev_bootstrap';

connectDB(URI).then(() => {
  app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`));
});
