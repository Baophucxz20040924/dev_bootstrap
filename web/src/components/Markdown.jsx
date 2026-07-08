// Tiny, dependency-free markdown renderer. Renders React nodes (no
// dangerouslySetInnerHTML) so content is safe from HTML/script injection.
// Supports: # / ## / ### headings, - bullet lists, `inline code`, **bold**.

function renderInline(text, keyPrefix) {
  // Split on `code` and **bold** while keeping the delimiters.
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={key} className="inline">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    return <span key={key}>{part}</span>;
  });
}

export default function Markdown({ text }) {
  const lines = (text || '').split('\n');
  const blocks = [];
  let list = null;

  const flushList = () => {
    if (list) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} style={{ margin: '4px 0 12px', paddingLeft: 20 }}>
          {list.map((item, i) => (
            <li key={i} style={{ marginBottom: 4 }}>{renderInline(item, `li-${blocks.length}-${i}`)}</li>
          ))}
        </ul>
      );
      list = null;
    }
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    const key = `b-${idx}`;
    if (/^###\s+/.test(line)) { flushList(); blocks.push(<h4 key={key}>{renderInline(line.replace(/^###\s+/, ''), key)}</h4>); return; }
    if (/^##\s+/.test(line)) { flushList(); blocks.push(<h3 key={key}>{renderInline(line.replace(/^##\s+/, ''), key)}</h3>); return; }
    if (/^#\s+/.test(line)) { flushList(); blocks.push(<h3 key={key}>{renderInline(line.replace(/^#\s+/, ''), key)}</h3>); return; }
    if (/^\s*[-*]\s+/.test(line)) {
      if (!list) list = [];
      list.push(line.replace(/^\s*[-*]\s+/, ''));
      return;
    }
    flushList();
    if (line.trim() === '') return;
    blocks.push(<p key={key} style={{ margin: '4px 0 10px', lineHeight: 1.6 }}>{renderInline(line, key)}</p>);
  });
  flushList();

  if (blocks.length === 0) return <p className="muted">Chưa có hướng dẫn.</p>;
  return <div>{blocks}</div>;
}
