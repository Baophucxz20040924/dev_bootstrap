// Seed definitions for modules. Each module has bash + powershell lifecycle steps.
// detect: exits 0 when already present (script then skips install).

export const MODULES = [
  {
    slug: 'git',
    name: 'Git',
    category: 'tool',
    description: 'Distributed version control system',
    defaultVersion: '1.0.0',
    version: {
      version: '1.0.0',
      channel: 'stable',
      bash: {
        detect: 'command -v git',
        install:
          'if command -v apt-get >/dev/null 2>&1; then sudo apt-get update -y && sudo apt-get install -y git; ' +
          'elif command -v brew >/dev/null 2>&1; then brew install git; ' +
          'elif command -v dnf >/dev/null 2>&1; then sudo dnf install -y git; ' +
          'else log_err "no supported package manager for git"; return 1; fi',
        verify: 'git --version',
        rollback: '',
      },
      powershell: {
        detect: 'Get-Command git -ErrorAction SilentlyContinue',
        install: 'winget install --id Git.Git -e --source winget --accept-source-agreements --accept-package-agreements',
        verify: 'git --version',
        rollback: '',
      },
    },
  },
  {
    slug: 'node',
    name: 'Node.js',
    category: 'tool',
    description: 'Node.js JavaScript runtime',
    defaultVersion: '1.0.0',
    version: {
      version: '1.0.0',
      channel: 'stable',
      bash: {
        detect: 'command -v node',
        install:
          'if command -v brew >/dev/null 2>&1; then brew install node; ' +
          'else curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs; fi',
        verify: 'node --version',
        rollback: '',
      },
      powershell: {
        detect: 'Get-Command node -ErrorAction SilentlyContinue',
        install: 'winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements',
        verify: 'node --version',
        rollback: '',
      },
    },
  },
  {
    slug: 'docker',
    name: 'Docker',
    category: 'tool',
    description: 'Container runtime and CLI',
    defaultVersion: '1.0.0',
    version: {
      version: '1.0.0',
      channel: 'stable',
      bash: {
        detect: 'command -v docker',
        install:
          'if command -v brew >/dev/null 2>&1; then brew install --cask docker; ' +
          'else curl -fsSL https://get.docker.com | sudo sh; fi',
        verify: 'docker --version',
        rollback: '',
      },
      powershell: {
        detect: 'Get-Command docker -ErrorAction SilentlyContinue',
        install: 'winget install --id Docker.DockerDesktop -e --accept-source-agreements --accept-package-agreements',
        verify: 'docker --version',
        rollback: '',
      },
    },
  },
  {
    slug: 'python',
    name: 'Python',
    category: 'tool',
    description: 'Python 3 interpreter',
    defaultVersion: '1.0.0',
    version: {
      version: '1.0.0',
      channel: 'stable',
      bash: {
        detect: 'command -v python3',
        install:
          'if command -v brew >/dev/null 2>&1; then brew install python; ' +
          'elif command -v apt-get >/dev/null 2>&1; then sudo apt-get install -y python3 python3-pip; ' +
          'else log_err "no package manager for python"; return 1; fi',
        verify: 'python3 --version',
        rollback: '',
      },
      powershell: {
        detect: 'Get-Command python -ErrorAction SilentlyContinue',
        install: 'winget install --id Python.Python.3.12 -e --accept-source-agreements --accept-package-agreements',
        verify: 'python --version',
        rollback: '',
      },
    },
  },
  {
    slug: 'uv',
    name: 'uv',
    category: 'tool',
    description: 'Fast Python package/venv manager',
    defaultVersion: '1.0.0',
    version: {
      version: '1.0.0',
      channel: 'stable',
      bash: {
        detect: 'command -v uv',
        install: 'curl -LsSf https://astral.sh/uv/install.sh | sh',
        verify: 'uv --version',
        rollback: 'rm -f "$HOME/.local/bin/uv" "$HOME/.local/bin/uvx"',
      },
      powershell: {
        detect: 'Get-Command uv -ErrorAction SilentlyContinue',
        install: 'powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"',
        verify: 'uv --version',
        rollback: '',
      },
    },
  },
  {
    slug: 'claude',
    name: 'Claude Code CLI',
    category: 'tool',
    description: 'Anthropic Claude Code command-line interface',
    defaultVersion: '1.0.0',
    version: {
      version: '1.0.0',
      channel: 'stable',
      env: { ANTHROPIC_API_KEY: { required: false, prompt: 'Enter ANTHROPIC_API_KEY (optional)' } },
      bash: {
        detect: 'command -v claude',
        install: 'npm install -g @anthropic-ai/claude-code',
        config: 'mkdir -p "$HOME/.claude"',
        verify: 'claude --version',
        rollback: 'npm uninstall -g @anthropic-ai/claude-code || true',
      },
      powershell: {
        detect: 'Get-Command claude -ErrorAction SilentlyContinue',
        install: 'npm install -g @anthropic-ai/claude-code',
        config: 'New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\\.claude" | Out-Null',
        verify: 'claude --version',
        rollback: 'npm uninstall -g @anthropic-ai/claude-code',
      },
    },
  },
];

// MCP servers registered into Claude Code via `claude mcp add`.
const MCP = [
  {
    slug: 'mcp/filesystem',
    name: 'Filesystem MCP',
    add: 'claude mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem "$HOME"',
    addPs: 'claude mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem "$env:USERPROFILE"',
    check: 'claude mcp list | grep -q filesystem',
    checkPs: 'claude mcp list | Select-String filesystem',
    remove: 'claude mcp remove filesystem',
  },
  {
    slug: 'mcp/github',
    name: 'GitHub MCP',
    env: { GITHUB_TOKEN: { required: false, prompt: 'Enter GITHUB_TOKEN (optional)' } },
    add: 'claude mcp add github -- npx -y @modelcontextprotocol/server-github',
    addPs: 'claude mcp add github -- npx -y @modelcontextprotocol/server-github',
    check: 'claude mcp list | grep -q github',
    checkPs: 'claude mcp list | Select-String github',
    remove: 'claude mcp remove github',
  },
  {
    slug: 'mcp/playwright',
    name: 'Playwright MCP',
    add: 'claude mcp add playwright -- npx -y @playwright/mcp@latest',
    addPs: 'claude mcp add playwright -- npx -y @playwright/mcp@latest',
    check: 'claude mcp list | grep -q playwright',
    checkPs: 'claude mcp list | Select-String playwright',
    remove: 'claude mcp remove playwright',
  },
  {
    slug: 'mcp/memory',
    name: 'Memory MCP',
    add: 'claude mcp add memory -- npx -y @modelcontextprotocol/server-memory',
    addPs: 'claude mcp add memory -- npx -y @modelcontextprotocol/server-memory',
    check: 'claude mcp list | grep -q memory',
    checkPs: 'claude mcp list | Select-String memory',
    remove: 'claude mcp remove memory',
  },
  {
    slug: 'mcp/context7',
    name: 'Context7 MCP',
    add: 'claude mcp add context7 -- npx -y @upstash/context7-mcp@latest',
    addPs: 'claude mcp add context7 -- npx -y @upstash/context7-mcp@latest',
    check: 'claude mcp list | grep -q context7',
    checkPs: 'claude mcp list | Select-String context7',
    remove: 'claude mcp remove context7',
  },
];

for (const m of MCP) {
  MODULES.push({
    slug: m.slug,
    name: m.name,
    category: 'mcp',
    description: `${m.name} server for Claude Code`,
    defaultVersion: '1.0.0',
    version: {
      version: '1.0.0',
      channel: 'stable',
      env: m.env || {},
      bash: { detect: m.check, install: m.add, verify: m.check, rollback: m.remove },
      powershell: { detect: m.checkPs, install: m.addPs, verify: m.checkPs, rollback: m.remove },
    },
  });
}

// SigNoz MCP server: runs as a Docker container in HTTP mode, then registered
// into Claude Code over the http transport. Docs:
// https://signoz.io/docs/ai/signoz-mcp-server/
MODULES.push({
  slug: 'mcp/signoz',
  name: 'SigNoz MCP',
  category: 'mcp',
  description: 'SigNoz observability MCP server (Docker, HTTP transport) for Claude Code',
  defaultVersion: '1.0.0',
  version: {
    version: '1.0.0',
    channel: 'stable',
    env: {
      SIGNOZ_URL: { required: true, prompt: 'Enter SIGNOZ_URL (e.g. http://localhost:3301)' },
      SIGNOZ_API_KEY: { required: true, prompt: 'Enter SIGNOZ_API_KEY (Settings > Service Accounts)' },
      SIGNOZ_MCP_PORT: { required: false, default: '8000', prompt: 'MCP server port' },
    },
    bash: {
      // Consider it present only if both the container is up and the mcp is registered.
      detect:
        'docker ps --format "{{.Names}}" | grep -q "^signoz-mcp$" && claude mcp list | grep -q signoz',
      install:
        'docker info >/dev/null 2>&1 || { log_err "Docker chưa chạy — hãy mở Docker Desktop / khởi động docker daemon rồi chạy lại"; return 1; }; ' +
        'docker pull signoz/signoz-mcp-server:latest && ' +
        'docker rm -f signoz-mcp >/dev/null 2>&1 || true; ' +
        'docker run -d --name signoz-mcp -p "$SIGNOZ_MCP_PORT:8000" ' +
        '-e TRANSPORT_MODE=http -e MCP_SERVER_PORT=8000 ' +
        '-e SIGNOZ_URL="$SIGNOZ_URL" -e SIGNOZ_API_KEY="$SIGNOZ_API_KEY" ' +
        'signoz/signoz-mcp-server:latest',
      config:
        'claude mcp remove signoz >/dev/null 2>&1 || true; ' +
        'claude mcp add --scope user --transport http signoz "http://localhost:$SIGNOZ_MCP_PORT/mcp"',
      // Verify the container is actually running (not just that the MCP got registered).
      verify: 'docker ps --format "{{.Names}}" | grep -q "^signoz-mcp$" && claude mcp list | grep -q signoz',
      rollback: 'claude mcp remove signoz >/dev/null 2>&1; docker rm -f signoz-mcp >/dev/null 2>&1',
    },
    powershell: {
      detect:
        '(docker ps --format "{{.Names}}" | Select-String "^signoz-mcp$") -and (claude mcp list | Select-String signoz)',
      install:
        'docker info *> $null; if ($LASTEXITCODE -ne 0) { Log-Err "Docker chưa chạy — hãy mở Docker Desktop rồi chạy lại"; return }; ' +
        'docker pull signoz/signoz-mcp-server:latest; ' +
        'docker rm -f signoz-mcp 2>$null; ' +
        'docker run -d --name signoz-mcp -p "$($env:SIGNOZ_MCP_PORT):8000" ' +
        '-e TRANSPORT_MODE=http -e MCP_SERVER_PORT=8000 ' +
        '-e SIGNOZ_URL="$env:SIGNOZ_URL" -e SIGNOZ_API_KEY="$env:SIGNOZ_API_KEY" ' +
        'signoz/signoz-mcp-server:latest',
      config:
        'claude mcp remove signoz 2>$null; ' +
        'claude mcp add --scope user --transport http signoz "http://localhost:$($env:SIGNOZ_MCP_PORT)/mcp"',
      // Verify the container is actually running (not just that the MCP got registered).
      verify: '(docker ps --format "{{.Names}}" | Select-String "^signoz-mcp$") -and (claude mcp list | Select-String signoz)',
      rollback: 'claude mcp remove signoz 2>$null; docker rm -f signoz-mcp 2>$null',
    },
  },
});

// ---- DevSecOps security scanners ----
// These CLIs must be present on PATH for the devsecops kit to scan.
MODULES.push({
  slug: 'semgrep',
  name: 'Semgrep',
  category: 'tool',
  description: 'SAST scanner for code patterns and security anti-patterns',
  defaultVersion: '1.0.0',
  version: {
    version: '1.0.0',
    channel: 'stable',
    bash: {
      detect: 'command -v semgrep',
      install:
        'if command -v pipx >/dev/null 2>&1; then pipx install semgrep; ' +
        'elif command -v pip3 >/dev/null 2>&1; then pip3 install --user semgrep; ' +
        'elif command -v brew >/dev/null 2>&1; then brew install semgrep; ' +
        'else log_err "need pipx/pip3/brew for semgrep"; return 1; fi',
      verify: 'semgrep --version',
      rollback: 'pipx uninstall semgrep 2>/dev/null || pip3 uninstall -y semgrep 2>/dev/null || true',
    },
    powershell: {
      detect: 'Test-PipPackage semgrep',
      install: '$py = Ensure-Python; & $py -m pip install --user semgrep; Add-UserScripts',
      verify: 'Test-PipPackage semgrep',
      rollback: '$py = Get-RealPython; if ($py) { & $py -m pip uninstall -y semgrep }',
    },
  },
});

MODULES.push({
  slug: 'gitleaks',
  name: 'Gitleaks',
  category: 'tool',
  description: 'Secret scanner: API keys, tokens, passwords in code',
  defaultVersion: '1.0.0',
  version: {
    version: '1.0.0',
    channel: 'stable',
    bash: {
      detect: 'command -v gitleaks',
      install:
        'if command -v brew >/dev/null 2>&1; then brew install gitleaks; ' +
        'elif command -v go >/dev/null 2>&1; then go install github.com/gitleaks/gitleaks/v8@latest; ' +
        'else log_err "need brew or go for gitleaks"; return 1; fi',
      verify: 'gitleaks version',
      rollback: '',
    },
    powershell: {
      detect: 'Get-Command gitleaks -ErrorAction SilentlyContinue',
      install: 'winget install --id Gitleaks.Gitleaks -e --accept-source-agreements --accept-package-agreements',
      verify: 'Get-Command gitleaks -ErrorAction SilentlyContinue',
      rollback: '',
    },
  },
});

MODULES.push({
  slug: 'trivy',
  name: 'Trivy',
  category: 'tool',
  description: 'Scanner for dependencies, container images, and misconfigurations',
  defaultVersion: '1.0.0',
  version: {
    version: '1.0.0',
    channel: 'stable',
    bash: {
      detect: 'command -v trivy',
      install:
        'if command -v brew >/dev/null 2>&1; then brew install trivy; ' +
        'else curl -fsSL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b "$HOME/.local/bin"; fi',
      verify: 'trivy --version',
      rollback: 'rm -f "$HOME/.local/bin/trivy"',
    },
    powershell: {
      detect: 'Get-Command trivy -ErrorAction SilentlyContinue',
      install: 'winget install --id AquaSecurity.Trivy -e --accept-source-agreements --accept-package-agreements',
      verify: 'Get-Command trivy -ErrorAction SilentlyContinue',
      rollback: '',
    },
  },
});

// DevSecOps Kit CLI. Binary is hosted by this platform ({{BASE_URL}} is expanded
// at generate time). Config (Checkov/AI + security-config.yml) is a SEPARATE
// module (config/devsecops) so it always runs even when the binary is already
// installed and this step gets skipped.
MODULES.push({
  slug: 'devsecops',
  name: 'DevSecOps Kit',
  category: 'tool',
  description: 'CLI that detects project type and runs Semgrep/Gitleaks/Trivy/Checkov scans',
  defaultVersion: '0.6.0',
  version: {
    version: '0.6.0',
    channel: 'stable',
    bash: {
      detect: 'test -x "$HOME/.local/bin/devsecops"',
      install:
        'mkdir -p "$HOME/.local/bin" && ' +
        'curl -fsSL "{{BASE_URL}}/bin/devsecops/linux-amd64" -o "$HOME/.local/bin/devsecops" && ' +
        'chmod +x "$HOME/.local/bin/devsecops" && export PATH="$HOME/.local/bin:$PATH"',
      verify: '"$HOME/.local/bin/devsecops" version',
      rollback: 'rm -f "$HOME/.local/bin/devsecops"',
    },
    powershell: {
      detect: 'Test-Path "$env:USERPROFILE\\.devsecops\\devsecops.exe"',
      install:
        '$d = "$env:USERPROFILE\\.devsecops"; New-Item -ItemType Directory -Force -Path $d | Out-Null; ' +
        'Invoke-WebRequest -Uri "{{BASE_URL}}/bin/devsecops/windows-amd64" -OutFile "$d\\devsecops.exe"; ' +
        '$env:PATH = "$d;$env:PATH"; ' +
        '[Environment]::SetEnvironmentVariable("PATH", "$d;" + [Environment]::GetEnvironmentVariable("PATH","User"), "User")',
      verify: 'Test-Path "$env:USERPROFILE\\.devsecops\\devsecops.exe"',
      rollback: 'Remove-Item -Force "$env:USERPROFILE\\.devsecops\\devsecops.exe" -ErrorAction SilentlyContinue',
    },
  },
});

// Config step for the devsecops kit: always runs (no detect). It ONLY checks that
// the required tools are present (reporting how to install anything missing —
// it never downloads/installs tools itself), makes sure the `devsecops` binary is
// on PATH so it doesn't 404 with "command not found", then configures the AI
// provider and writes security-config.yml.
MODULES.push({
  slug: 'config/devsecops',
  name: 'DevSecOps Config',
  category: 'config',
  description: 'Check required scanners + devsecops PATH, configure AI, write security-config.yml (no installs)',
  defaultVersion: '1.0.0',
  version: {
    version: '1.0.0',
    channel: 'stable',
    env: {
      DEVSECOPS_ENABLE_CHECKOV: { required: false, default: 'no', prompt: 'Bật Checkov IaC scanning? (yes/no)' },
      DEVSECOPS_AI: { required: false, default: 'ollama', prompt: 'AI provider cho gợi ý fix (ollama/openai/anthropic/none)' },
      DEVSECOPS_AI_MODEL: { required: false, default: 'llama3.1', prompt: 'Tên AI model' },
      DEVSECOPS_AI_ENDPOINT: { required: false, default: 'http://localhost:11434', prompt: 'AI endpoint (chỉ dùng cho ollama)' },
    },
    bash: {
      // No detect: config should run every time.
      install: [
        '# --- Ensure `devsecops` is on PATH (do not install it) ---',
        'for d in "$HOME/.local/bin" "$HOME/bin" "$HOME/.devsecops"; do',
        '  if [ -x "$d/devsecops" ]; then',
        '    case ":$PATH:" in *":$d:"*) ;; *) export PATH="$d:$PATH"; log_info "Added $d to PATH (this session)";; esac',
        '    if ! grep -qs "$d" "$HOME/.bashrc" 2>/dev/null; then printf \'\\nexport PATH="%s:$PATH"\\n\' "$d" >> "$HOME/.bashrc"; log_info "Persisted $d to ~/.bashrc"; fi',
        '  fi',
        'done',
        '# --- Check required tools (report only, never install) ---',
        'check_tool() { if command -v "$1" >/dev/null 2>&1; then log_ok "$1 found"; else log_warn "$1 chưa có -> cài: $2"; fi; }',
        'check_tool devsecops "chạy installer devsecops, rồi đảm bảo binary nằm trong PATH"',
        'check_tool semgrep "pipx install semgrep (hoặc pip install --user semgrep)"',
        'check_tool gitleaks "brew install gitleaks | winget install Gitleaks.Gitleaks"',
        'check_tool trivy "brew install trivy | https://aquasecurity.github.io/trivy"',
        'if [ "$DEVSECOPS_ENABLE_CHECKOV" = "yes" ]; then check_tool checkov "pipx install checkov (hoặc pip install checkov)"; fi',
        '# --- Write security-config.yml: bật hết tool, AI theo lựa chọn ---',
        'if [ "$DEVSECOPS_AI" = "none" ]; then AI_EN=false; else AI_EN=true; fi',
        'if [ "$DEVSECOPS_ENABLE_CHECKOV" = "yes" ]; then CHECKOV_EN=true; else CHECKOV_EN=false; fi',
        '{',
        '  echo "# Generated by Dev Bootstrap Platform"',
        '  echo "version: \\"0.6.0\\""',
        '  echo "severity_threshold: \\"high\\""',
        '  echo "tools:"',
        '  echo "  semgrep: true"',
        '  echo "  trivy: true"',
        '  echo "  gitleaks: true"',
        '  echo "  checkov: $CHECKOV_EN"',
        '  echo "ai:"',
        '  echo "  enabled: $AI_EN"',
        '  echo "  provider: \\"$DEVSECOPS_AI\\""',
        '  echo "  model: \\"$DEVSECOPS_AI_MODEL\\""',
        '  echo "  endpoint: \\"$DEVSECOPS_AI_ENDPOINT\\""',
        '} > security-config.yml',
        'log_ok "security-config.yml đã ghi"',
      ].join('\n'),
      verify: 'test -f security-config.yml',
      rollback: 'rm -f security-config.yml',
    },
    powershell: {
      install: [
        '# --- Ensure devsecops.exe is on PATH (do not install it) ---',
        '$dd = "$env:USERPROFILE\\.devsecops"',
        'if (Test-Path "$dd\\devsecops.exe") {',
        '  if (($env:PATH -split ";") -notcontains $dd) { $env:PATH = "$dd;$env:PATH" }',
        '  $up = [Environment]::GetEnvironmentVariable("PATH","User")',
        '  if (($up -split ";") -notcontains $dd) { [Environment]::SetEnvironmentVariable("PATH","$dd;$up","User"); Log-Info "Added $dd to your PATH" }',
        '}',
        'Refresh-Path',
        '# --- Check required tools (report only, never install) ---',
        'function Check-Tool($n,$hint){ if (Get-Command $n -ErrorAction SilentlyContinue) { Log-Ok "$n found" } else { Log-Warn "$n chưa có -> cài: $hint" } }',
        'Check-Tool devsecops "chạy installer devsecops rồi mở terminal mới"',
        'Check-Tool semgrep "py -m pip install --user semgrep"',
        'Check-Tool gitleaks "winget install Gitleaks.Gitleaks"',
        'Check-Tool trivy "winget install AquaSecurity.Trivy"',
        'if ($env:DEVSECOPS_ENABLE_CHECKOV -eq "yes") { Check-Tool checkov "py -m pip install --user checkov" }',
        '# --- Write security-config.yml: bật hết tool, AI theo lựa chọn ---',
        '$en = if ($env:DEVSECOPS_AI -eq "none") { "false" } else { "true" }',
        '$checkov = if ($env:DEVSECOPS_ENABLE_CHECKOV -eq "yes") { "true" } else { "false" }',
        '$yml = @("# Generated by Dev Bootstrap Platform",',
        '  "version: `"0.6.0`"", "severity_threshold: `"high`"", "tools:",',
        '  "  semgrep: true", "  trivy: true", "  gitleaks: true", "  checkov: $checkov",',
        '  "ai:", "  enabled: $en", "  provider: `"$env:DEVSECOPS_AI`"", "  model: `"$env:DEVSECOPS_AI_MODEL`"", "  endpoint: `"$env:DEVSECOPS_AI_ENDPOINT`"") -join "`n"',
        '[IO.File]::WriteAllText((Join-Path (Get-Location) "security-config.yml"), $yml + "`n", (New-Object System.Text.UTF8Encoding $false))',
        'Log-Ok "security-config.yml đã ghi"',
      ].join('\n'),
      verify: 'Test-Path security-config.yml',
      rollback: 'Remove-Item -Force security-config.yml -ErrorAction SilentlyContinue',
    },
  },
});
