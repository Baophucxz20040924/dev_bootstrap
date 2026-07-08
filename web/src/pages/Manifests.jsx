import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

// Projects list + create/delete.
export default function Manifests() {
  const { isAdmin } = useAuth();
  const kind = 'projects';
  const label = 'Project';
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ slug: '', name: '', description: '' });

  const load = () => api.get(`/api/${kind}`).then(setItems).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await api.post(`/api/${kind}`, { ...form, steps: [] });
      setForm({ slug: '', name: '', description: '' });
      load();
    } catch (ex) { setErr(ex.message); }
  };

  const remove = async (slug) => {
    if (!confirm(`Delete ${slug}?`)) return;
    try { await api.del(`/api/${kind}/${slug}`); load(); }
    catch (ex) { setErr(ex.message); }
  };

  return (
    <div>
      <div className="topbar"><h2>{label}s</h2></div>
      {err && <div className="error">{err}</div>}

      <div className="grid">
        {items.map((p) => {
          const maintenance = p.enabled === false;
          const locked = maintenance && !isAdmin; // dev/devops can't open a project in maintenance
          return (
            <div key={p.slug} className="card">
              <div className="flex-between">
                {locked ? (
                  <strong className="muted">{p.name}</strong>
                ) : (
                  <Link to={`/${kind}/${p.slug}`}><strong>{p.name}</strong></Link>
                )}
                {isAdmin && <button className="danger" onClick={() => remove(p.slug)}>Delete</button>}
              </div>
              <div className="muted" style={{ fontSize: 13 }}>{p.description}</div>
              <div style={{ marginTop: 8 }}>
                {maintenance && <span className="badge" style={{ color: '#f0a020', borderColor: '#f0a020' }}>🚧 Đang bảo trì</span>}
                <span className="badge">{p.steps.length} steps</span>
                <span className="badge">v{p.version}</span>
              </div>
            </div>
          );
        })}
      </div>

      {isAdmin && (
        <div className="card">
          <h3>Add {label.toLowerCase()}</h3>
          <form onSubmit={create}>
            <div className="row">
              <div style={{ flex: 1 }}>
                <label>Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
            </div>
            <label>Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <button type="submit">Create</button>
          </form>
        </div>
      )}
    </div>
  );
}
