import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function Modules() {
  const { isAdmin } = useAuth();
  const [modules, setModules] = useState([]);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ slug: '', name: '', category: 'tool', description: '' });

  const load = () => api.get('/api/modules').then(setModules).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await api.post('/api/modules', form);
      setForm({ slug: '', name: '', category: 'tool', description: '' });
      load();
    } catch (ex) { setErr(ex.message); }
  };

  const remove = async (slug) => {
    if (!confirm(`Delete module ${slug}?`)) return;
    try { await api.del(`/api/modules/${slug}`); load(); }
    catch (ex) { setErr(ex.message); }
  };

  return (
    <div>
      <div className="topbar"><h2>Modules</h2></div>
      {err && <div className="error">{err}</div>}

      <div className="card">
        <table>
          <thead>
            <tr><th>Module</th><th>Slug</th><th>Category</th><th>Versions</th>{isAdmin && <th></th>}</tr>
          </thead>
          <tbody>
            {modules.map((m) => (
              <tr key={m.slug}>
                <td><strong>{m.name}</strong><div className="muted" style={{ fontSize: 12 }}>{m.description}</div></td>
                <td><code className="inline">{m.slug}</code></td>
                <td><span className={`badge ${m.category}`}>{m.category}</span></td>
                <td>{(m.versions || []).map((v) => <span key={v.version} className="badge">{v.version}</span>)}</td>
                {isAdmin && <td><button className="danger" onClick={() => remove(m.slug)}>Delete</button></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAdmin ? (
        <div className="card">
          <h3>Add module</h3>
          <form onSubmit={create}>
            <div className="row">
              <div style={{ flex: 1 }}>
                <label>Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g. pnpm" />
              </div>
              <div style={{ flex: 1 }}>
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. pnpm" />
              </div>
              <div style={{ width: 160 }}>
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="tool">tool</option>
                  <option value="mcp">mcp</option>
                  <option value="config">config</option>
                </select>
              </div>
            </div>
            <label>Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <button type="submit">Create</button>
          </form>
          <p className="muted" style={{ fontSize: 12 }}>Add versions with install/detect scripts via the API (POST /api/modules/:slug/versions).</p>
        </div>
      ) : (
        <p className="muted">Login to manage modules.</p>
      )}
    </div>
  );
}
