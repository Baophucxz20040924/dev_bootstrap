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

  const load = () => api.get(`/api/${kind}`).then(setItems).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

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
                {p.installPath
                  ? <span className="badge">custom</span>
                  : <span className="badge">{p.steps.length} steps</span>}
                <span className="badge">v{p.version}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
