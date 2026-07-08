import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function Dashboard() {
  const [data, setData] = useState({ modules: [], projects: [] });
  const [err, setErr] = useState('');

  useEffect(() => {
    Promise.all([api.get('/api/modules'), api.get('/api/projects')])
      .then(([modules, projects]) => setData({ modules, projects }))
      .catch((e) => setErr(e.message));
  }, []);

  const stat = (n, label) => (
    <div className="card" style={{ minWidth: 140 }}>
      <div style={{ fontSize: 30, fontWeight: 700 }}>{n}</div>
      <div className="muted">{label}</div>
    </div>
  );

  return (
    <div>
      <div className="topbar">
        <h2>Dashboard</h2>
      </div>
      {err && <div className="error">{err}</div>}
      <div className="row">
        {stat(data.modules.length, 'Modules')}
        {stat(data.projects.length, 'Projects')}
      </div>

      <div className="card">
        <h3>Projects</h3>
        <div className="grid">
          {data.projects.map((p) => (
            <Link key={p.slug} to={`/projects/${p.slug}`} className="card" style={{ margin: 0 }}>
              <strong>{p.name}</strong>
              <div className="muted" style={{ fontSize: 13 }}>{p.description}</div>
              <div style={{ marginTop: 8 }} className="badge">{p.steps.length} steps</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
