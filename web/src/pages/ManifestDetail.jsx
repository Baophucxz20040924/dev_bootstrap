import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import Markdown from '../components/Markdown.jsx';

// Fallback copy for HTTP-LAN (no navigator.clipboard): select a temp textarea
// and use the legacy execCommand('copy').
function fallbackCopy(text, done) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    done();
  } catch { /* ignore */ }
}

export default function ManifestDetail() {
  const { slug } = useParams();
  const { user, isAdmin } = useAuth();
  const loggedIn = !!user;
  const [item, setItem] = useState(null);
  const [allModules, setAllModules] = useState([]);
  const [preview, setPreview] = useState(null);
  const [flavor, setFlavor] = useState('bash');
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState('');
  const [editing, setEditing] = useState(false);
  const [meta, setMeta] = useState({ name: '', description: '' });
  const [editingGuide, setEditingGuide] = useState(false);
  const [guideDraft, setGuideDraft] = useState('');

  const base = `/api/projects/${slug}`;

  const loadAll = () => {
    api.get(base).then(setItem).catch((e) => setErr(e.message));
    api.get(`/install/${slug}/preview.json`).then(setPreview).catch(() => setPreview(null));
    if (isAdmin) api.get('/api/modules').then(setAllModules).catch(() => {});
  };
  useEffect(() => { loadAll(); }, [slug, isAdmin]);

  const patch = async (fields) => {
    setErr('');
    try {
      const updated = await api.put(base, { ...item, ...fields });
      setItem(updated);
      api.get(`/install/${slug}/preview.json`).then(setPreview).catch(() => setPreview(null));
      return updated;
    } catch (ex) { setErr(ex.message); }
  };

  const save = (steps) => patch({ steps });
  const startEdit = () => { setMeta({ name: item.name, description: item.description || '' }); setEditing(true); };
  const saveMeta = async () => { await patch({ name: meta.name, description: meta.description }); setEditing(false); };
  const startEditGuide = () => { setGuideDraft(item.guide || ''); setEditingGuide(true); };
  const saveGuide = async () => { await patch({ guide: guideDraft }); setEditingGuide(false); };

  const toggleEnabled = () => patch({ enabled: !(item.enabled !== false) });
  const toggleRole = (role) => {
    const cur = item.allowedRoles || [];
    const next = cur.includes(role) ? cur.filter((r) => r !== role) : [...cur, role];
    patch({ allowedRoles: next });
  };

  const addStep = (moduleSlug) => { if (moduleSlug) save([...(item.steps || []), { moduleSlug, version: 'default' }]); };
  const removeStep = (idx) => save(item.steps.filter((_, i) => i !== idx));
  const moveStep = (idx, dir) => {
    const steps = [...item.steps];
    const j = idx + dir;
    if (j < 0 || j >= steps.length) return;
    [steps[idx], steps[j]] = [steps[j], steps[idx]];
    save(steps);
  };

  if (!item) return <div>{err ? <div className="error">{err}</div> : 'Loading...'}</div>;

  const maintenance = item.enabled === false;
  // Commands/script/steps are visible only to logged-in users, and hidden during
  // maintenance for everyone except admin.
  const canSeeCommands = loggedIn && (!maintenance || isAdmin);

  // Prefer the backend's PUBLIC_BASE_URL (correct host:port for install), fall
  // back to current origin only if the preview isn't loaded yet.
  const origin = preview?.baseUrl || window.location.origin;
  const custom = !!item.installPath;
  const cmdBash = custom
    ? `curl -fsSL ${origin}${item.installPath} | bash`
    : `curl -fsSL ${origin}/install/${slug} | bash`;
  const cmdPs = custom
    ? `irm ${origin}${item.installPath} | iex`
    : `irm ${origin}/install/${slug}/powershell | iex`;
  const copy = (text, tag) => {
    const done = () => { setCopied(tag); setTimeout(() => setCopied(''), 1500); };
    // navigator.clipboard chỉ hoạt động trên HTTPS/localhost. Trên HTTP-LAN
    // nó undefined nên fallback sang execCommand qua một textarea tạm.
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  };
  const scriptText = preview ? (flavor === 'bash' ? preview.bash : preview.powershell) : '';

  return (
    <div>
      <div className="topbar">
        <h2>
          {item.name} <span className="badge">project</span>
          {maintenance && <span className="badge" style={{ color: '#f0a020', borderColor: '#f0a020' }}>🚧 Bảo trì</span>}
        </h2>
        {isAdmin && !editing && <button className="secondary" onClick={startEdit}>Edit</button>}
      </div>
      {err && <div className="error">{err}</div>}

      {/* PLACEHOLDER_ADMIN_CONTROLS */}
      {isAdmin && (
        <div className="card">
          <h3>Quản trị</h3>
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: 12 }}>
            <div>
              <label>Trạng thái</label>
              <button className={maintenance ? '' : 'secondary'} onClick={toggleEnabled}>
                {maintenance ? 'Bật lại (đang bảo trì)' : 'Đưa vào bảo trì'}
              </button>
            </div>
            <div>
              <label>Role được xem (devops & admin luôn thấy)</label>
              <div className="row" style={{ gap: 16 }}>
                {['dev', 'devops'].map((r) => (
                  <label key={r} style={{ display: 'flex', gap: 6, alignItems: 'center', margin: 0 }}>
                    <input
                      type="checkbox"
                      style={{ width: 'auto', margin: 0 }}
                      checked={(item.allowedRoles || []).includes(r)}
                      onChange={() => toggleRole(r)}
                    />
                    {r}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {editing ? (
        <div className="card">
          <h3>Edit details</h3>
          <label>Name</label>
          <input value={meta.name} onChange={(e) => setMeta({ ...meta, name: e.target.value })} />
          <label>Description</label>
          <textarea rows={3} value={meta.description} onChange={(e) => setMeta({ ...meta, description: e.target.value })} />
          <div className="row">
            <button onClick={saveMeta}>Save</button>
            <button className="secondary" onClick={() => setEditing(false)}>Cancel</button>
          </div>
          <p className="muted" style={{ fontSize: 12 }}>Slug (<code className="inline">{slug}</code>) is fixed — it's used in the install URL.</p>
        </div>
      ) : (
        <p className="muted">{item.description}</p>
      )}

      {maintenance && !isAdmin && (
        <div className="card">
          <h3>🚧 Đang bảo trì</h3>
          <p className="muted">Project này tạm thời không khả dụng. Vui lòng quay lại sau.</p>
        </div>
      )}

      {canSeeCommands && (
        <div className="card">
          <h3>One-line install</h3>
          <label>Linux / macOS</label>
          <pre style={{ maxHeight: 'none' }}>{cmdBash}</pre>
          <button className="secondary" onClick={() => copy(cmdBash, 'bash')}>
            {copied === 'bash' ? 'Copied!' : 'Copy'}
          </button>
          <label style={{ marginTop: 12 }}>Windows PowerShell</label>
          <pre style={{ maxHeight: 'none' }}>{cmdPs}</pre>
          <button className="secondary" onClick={() => copy(cmdPs, 'ps')}>
            {copied === 'ps' ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}

      {!loggedIn && (
        <div className="card">
          <p className="muted">Đăng nhập để xem lệnh cài đặt và script.</p>
        </div>
      )}

      <div className="card">
        <div className="flex-between">
          <h3>Hướng dẫn sử dụng</h3>
          {isAdmin && !editingGuide && (
            <button className="secondary" onClick={startEditGuide}>Edit</button>
          )}
        </div>
        {editingGuide ? (
          <>
            <textarea
              rows={14}
              value={guideDraft}
              onChange={(e) => setGuideDraft(e.target.value)}
              placeholder="Viết hướng dẫn (hỗ trợ Markdown: # tiêu đề, - danh sách, `code`, **đậm**)"
              style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13 }}
            />
            <div className="row">
              <button onClick={saveGuide}>Save</button>
              <button className="secondary" onClick={() => setEditingGuide(false)}>Cancel</button>
            </div>
            <p className="muted" style={{ fontSize: 12 }}>
              Hỗ trợ Markdown cơ bản: <code className="inline"># tiêu đề</code>, <code className="inline">- danh sách</code>, <code className="inline">`code`</code>, <code className="inline">**đậm**</code>.
            </p>
          </>
        ) : (
          <Markdown text={item.guide} />
        )}
      </div>

      {canSeeCommands && !custom && preview?.env?.length > 0 && (
        <div className="card">
          <h3>Values you'll be asked for</h3>
          <p className="muted" style={{ fontSize: 13 }}>
            The install script prompts for these at run time (or reads them from your environment).
          </p>
          <table>
            <thead>
              <tr><th>Variable</th><th>Prompt</th><th>Required</th><th>Default</th></tr>
            </thead>
            <tbody>
              {preview.env.map((e) => (
                <tr key={e.key}>
                  <td><code className="inline">{e.key}</code></td>
                  <td className="muted">{e.prompt || '—'}</td>
                  <td>{e.required ? <span className="badge tool">required</span> : <span className="badge">optional</span>}</td>
                  <td>{e.default ? <code className="inline">{e.default}</code> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canSeeCommands && !custom && (
        <div className="card">
          <div className="flex-between">
            <h3>Steps ({item.steps.length})</h3>
          </div>
          {preview?.missing?.length > 0 && (
            <div className="error">Missing modules: {preview.missing.join(', ')}</div>
          )}
          <table>
            <thead>
              <tr><th>#</th><th>Module</th><th>Version</th>{isAdmin && <th>Reorder</th>}{isAdmin && <th></th>}</tr>
            </thead>
            <tbody>
              {item.steps.map((s, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td><code className="inline">{s.moduleSlug}</code></td>
                  <td>{s.version}</td>
                  {isAdmin && (
                    <td>
                      <button className="secondary" onClick={() => moveStep(i, -1)}>↑</button>{' '}
                      <button className="secondary" onClick={() => moveStep(i, 1)}>↓</button>
                    </td>
                  )}
                  {isAdmin && <td><button className="danger" onClick={() => removeStep(i)}>Remove</button></td>}
                </tr>
              ))}
            </tbody>
          </table>
          {isAdmin && (
            <div style={{ marginTop: 12, maxWidth: 320 }}>
              <label>Add module step</label>
              <select onChange={(e) => { addStep(e.target.value); e.target.value = ''; }} defaultValue="">
                <option value="" disabled>Select a module...</option>
                {allModules.map((m) => (
                  <option key={m.slug} value={m.slug}>{m.name} ({m.slug})</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {canSeeCommands && !custom && (
        <div className="card">
          <div className="flex-between">
            <h3>Generated script</h3>
            <div className="tabs">
              <button className={flavor === 'bash' ? 'active' : ''} onClick={() => setFlavor('bash')}>Bash</button>
              <button className={flavor === 'powershell' ? 'active' : ''} onClick={() => setFlavor('powershell')}>PowerShell</button>
            </div>
          </div>
          <pre>{scriptText || '# no resolvable steps yet'}</pre>
        </div>
      )}
    </div>
  );
}
