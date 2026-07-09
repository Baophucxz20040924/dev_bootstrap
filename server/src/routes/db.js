import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, '..', '..', 'bin', 'DB_SSM.txt');

// Parse DB_SSM.txt into a list of connection entries.
// Format per block:
//   <name>
//   aws ssm start-session ...
//   arn:aws:iam::<acct>:role/<profile>   (optional)
// Blocks are separated by blank lines.
function parseConnections(text) {
  const lines = text.split(/\r?\n/);
  const entries = [];
  let current = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (/^aws\s+ssm/i.test(line)) {
      if (current) current.command = line;
      continue;
    }
    if (/^arn:aws:iam::/i.test(line)) {
      if (current) {
        current.role = line;
        const m = line.match(/role\/(.+)$/);
        if (m) current.profileHint = m[1];
      }
      continue;
    }
    // Anything else starts a new named entry.
    current = { name: line, command: '', role: '', profileHint: '' };
    entries.push(current);
  }

  return entries.filter((e) => e.command);
}

// Escape a JS string for embedding inside a single-quoted PowerShell literal.
function psQuote(s) {
  return `'${String(s).replace(/'/g, "''")}'`;
}

function buildScript(entries) {
  const items = entries
    .map(
      (e) =>
        `  [pscustomobject]@{ Name = ${psQuote(e.name)}; Command = ${psQuote(
          e.command
        )}; Profile = ${psQuote(e.profileHint)} }`
    )
    .join(",\n");

  return `# Auto-generated AWS SSM DB connection launcher
$ErrorActionPreference = 'Stop'
$connections = @(
${items}
)

Write-Host ''
Write-Host 'Chon connection DB:' -ForegroundColor Cyan
for ($i = 0; $i -lt $connections.Count; $i++) {
  $c = $connections[$i]
  $hint = if ($c.Profile) { " (profile goi y: $($c.Profile))" } else { '' }
  Write-Host ("  [{0}] {1}{2}" -f ($i + 1), $c.Name, $hint)
}
Write-Host ''

$sel = Read-Host 'Nhap so thu tu'
$idx = 0
if (-not [int]::TryParse($sel, [ref]$idx) -or $idx -lt 1 -or $idx -gt $connections.Count) {
  Write-Host 'Lua chon khong hop le.' -ForegroundColor Red
  exit 1
}

$conn = $connections[$idx - 1]

$promptText = if ($conn.Profile) { "Nhap AWS_PROFILE [$($conn.Profile)]" } else { 'Nhap AWS_PROFILE' }
$profile = Read-Host $promptText
if ([string]::IsNullOrWhiteSpace($profile)) { $profile = $conn.Profile }
if ([string]::IsNullOrWhiteSpace($profile)) {
  Write-Host 'Chua nhap AWS_PROFILE.' -ForegroundColor Red
  exit 1
}

$env:AWS_PROFILE = $profile
Write-Host ''
Write-Host ("=> AWS_PROFILE = {0}" -f $profile) -ForegroundColor Green
Write-Host ("=> {0}" -f $conn.Name) -ForegroundColor Green
Write-Host ("=> {0}" -f $conn.Command) -ForegroundColor DarkGray
Write-Host ''

Invoke-Expression $conn.Command
`;
}

router.get('/', (_req, res) => {
  if (!fs.existsSync(DB_FILE)) {
    return res.status(404).type('text/plain').send('# DB_SSM.txt not found\n');
  }
  const text = fs.readFileSync(DB_FILE, 'utf8');
  const entries = parseConnections(text);
  if (!entries.length) {
    return res.status(422).type('text/plain').send('# no connections parsed from DB_SSM.txt\n');
  }
  res.type('text/plain').send(buildScript(entries));
});

// JSON view for debugging / the web UI.
router.get('/list.json', (_req, res) => {
  if (!fs.existsSync(DB_FILE)) return res.status(404).json({ error: 'DB_SSM.txt not found' });
  const entries = parseConnections(fs.readFileSync(DB_FILE, 'utf8'));
  res.json({ count: entries.length, connections: entries });
});

export default router;
