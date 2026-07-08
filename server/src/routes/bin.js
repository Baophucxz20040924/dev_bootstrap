import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BIN_DIR = path.join(__dirname, '..', '..', 'bin');

// Maps a platform key to the hosted binary filename.
const FILES = {
  windows: 'devsecops-windows-amd64.exe',
  'windows-amd64': 'devsecops-windows-amd64.exe',
  linux: 'devsecops-linux-amd64',
  'linux-amd64': 'devsecops-linux-amd64',
  darwin: 'devsecops-darwin-amd64',
  'darwin-amd64': 'devsecops-darwin-amd64',
  'darwin-arm64': 'devsecops-darwin-arm64',
};

router.get('/devsecops/:platform', (req, res) => {
  const file = FILES[req.params.platform.toLowerCase()];
  if (!file) return res.status(404).json({ error: 'unknown platform', known: Object.keys(FILES) });

  const full = path.join(BIN_DIR, file);
  if (!fs.existsSync(full)) {
    return res.status(404).json({ error: `binary not hosted yet: ${file}` });
  }
  res.download(full, file);
});

export default router;
