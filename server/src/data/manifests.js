const step = (moduleSlug, version = 'default') => ({ moduleSlug, version });

export const PROJECTS = [
  {
    slug: 'claude-code',
    name: 'Claude Code',
    description: 'Everything needed to run Claude Code with core MCP servers',
    guide: `# Cách dùng
1. Copy lệnh one-line ở trên và chạy trên máy của bạn.
2. Khi được hỏi \`ANTHROPIC_API_KEY\`, dán key của bạn vào (hoặc set sẵn biến môi trường).
3. Sau khi cài xong, mở terminal mới và chạy \`claude\` để bắt đầu.

## Bao gồm
- Docker, Git, Node, Claude CLI
- Các MCP server: filesystem, playwright, memory, github

## Lưu ý
- Cần đăng nhập tài khoản Claude lần đầu.
- GitHub MCP cần \`GITHUB_TOKEN\` nếu muốn thao tác repo riêng tư.`,
    steps: [
      step('docker'),
      step('git'),
      step('node'),
      step('claude'),
      step('mcp/filesystem'),
      step('mcp/playwright'),
      step('mcp/memory'),
      step('mcp/github'),
    ],
  },
  {
    slug: 'signoz-mcp',
    name: 'SigNoz MCP',
    description: 'Connect Claude Code to a self-hosted SigNoz via the SigNoz MCP server (Docker, HTTP)',
    guide: `# Cách dùng
1. Đảm bảo SigNoz đang chạy (self-hosted) và bạn có endpoint HTTP của nó.
2. Chạy lệnh one-line ở trên; script sẽ cài Docker, Node, Claude CLI và đăng ký SigNoz MCP.
3. Trỏ MCP tới endpoint SigNoz của bạn khi được hỏi.

## Sau khi cài
Hỏi Claude về logs/traces/metrics — nó sẽ truy vấn SigNoz qua MCP.`,
    steps: [step('docker'), step('node'), step('claude'), step('mcp/signoz')],
  },
  {
    slug: 'devsecops',
    name: 'DevSecOps Kit',
    description: 'Kiểm tra scanner (Semgrep/Gitleaks/Trivy/Checkov) + devsecops CLI, cấu hình AI và sinh security-config.yml',
    guide: `# Cách dùng
1. Chạy lệnh one-line ở trên.
2. Script sẽ **kiểm tra** các công cụ cần thiết — nếu thiếu, nó chỉ báo cách cài chứ **không tự tải/cài** giúp bạn.
3. Script hỏi cấu hình AI (Enter để dùng mặc định) rồi ghi \`security-config.yml\`.
4. Cài những tool còn thiếu (theo hướng dẫn script in ra), rồi chạy \`devsecops scan\` trong thư mục dự án.

## Công cụ cần có trước
- \`devsecops\` CLI (script sẽ tự thêm vào PATH nếu tìm thấy trong thư mục cài mặc định)
- \`semgrep\`, \`gitleaks\`, \`trivy\`
- \`checkov\` (chỉ khi bạn bật \`DEVSECOPS_ENABLE_CHECKOV=yes\`)

## Cấu hình AI (gợi ý fix)
- \`DEVSECOPS_AI\`: \`ollama\` / \`openai\` / \`anthropic\` / \`none\`
- \`DEVSECOPS_AI_MODEL\`, \`DEVSECOPS_AI_ENDPOINT\` (ollama)

> Script không cài Ollama. Nếu chọn \`ollama\`, tự đảm bảo Ollama đang chạy ở endpoint đã cấu hình.`,
    allowedRoles: ['devops'],
    steps: [step('config/devsecops')],
  },
];
