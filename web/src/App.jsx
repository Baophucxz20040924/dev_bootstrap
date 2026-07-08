import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Modules from './pages/Modules.jsx';
import Manifests from './pages/Manifests.jsx';
import ManifestDetail from './pages/ManifestDetail.jsx';
import Users from './pages/Users.jsx';

function Sidebar() {
  const { user, role, isAdmin, logout } = useAuth();
  return (
    <aside className="sidebar">
      <h1>⚡ Dev Bootstrap</h1>
      <nav>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/projects">Projects</NavLink>
        {isAdmin && <NavLink to="/modules">Modules</NavLink>}
        {isAdmin && <NavLink to="/users">Users</NavLink>}
      </nav>
      <div style={{ marginTop: 24, fontSize: 13 }}>
        {user ? (
          <>
            <div className="muted">{user.email}</div>
            <span className="badge" style={{ marginTop: 6, display: 'inline-block' }}>{role}</span>
            <button className="secondary" style={{ marginTop: 8 }} onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <NavLink to="/login">Login</NavLink>
        )}
      </div>
    </aside>
  );
}

// Admin-only route guard: redirect non-admins home.
function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  return isAdmin ? children : <Navigate to="/" />;
}

export default function App() {
  const { loading } = useAuth();
  if (loading) return <div className="main">Loading...</div>;

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/modules" element={<AdminRoute><Modules /></AdminRoute>} />
          <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
          <Route path="/projects" element={<Manifests />} />
          <Route path="/projects/:slug" element={<ManifestDetail />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
