import { useEffect, useState } from 'react';
import { api } from '../api.js';

const ROLES = ['admin', 'dev', 'devops'];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ email: '', name: '', password: '', role: 'dev' });

  const load = () => api.get('/api/users').then(setUsers).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await api.post('/api/users', form);
      setForm({ email: '', name: '', password: '', role: 'dev' });
      load();
    } catch (ex) { setErr(ex.message); }
  };

  const changeRole = async (id, role) => {
    setErr('');
    try { await api.put(`/api/users/${id}`, { role }); load(); }
    catch (ex) { setErr(ex.message); }
  };

  const resetPassword = async (id, email) => {
    const password = prompt(`Mật khẩu mới cho ${email}:`);
    if (!password) return;
    try { await api.put(`/api/users/${id}`, { password }); alert('Đã đổi mật khẩu.'); }
    catch (ex) { setErr(ex.message); }
  };

  const remove = async (id, email) => {
    if (!confirm(`Xóa người dùng ${email}?`)) return;
    try { await api.del(`/api/users/${id}`); load(); }
    catch (ex) { setErr(ex.message); }
  };

  return (
    <div>
      <div className="topbar"><h2>Người dùng</h2></div>
      {err && <div className="error">{err}</div>}

      <div className="card">
        <table>
          <thead>
            <tr><th>Email</th><th>Tên</th><th>Role</th><th></th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td><strong>{u.email}</strong></td>
                <td>{u.name || '—'}</td>
                <td>
                  <select value={u.role} onChange={(e) => changeRole(u._id, e.target.value)} style={{ width: 130, marginBottom: 0 }}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td>
                  <button className="secondary" onClick={() => resetPassword(u._id, u.email)}>Đổi mật khẩu</button>{' '}
                  <button className="danger" onClick={() => remove(u._id, u.email)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Thêm người dùng</h3>
        <form onSubmit={create}>
          <div className="row">
            <div style={{ flex: 1 }}>
              <label>Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@local.dev" />
            </div>
            <div style={{ flex: 1 }}>
              <label>Tên</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div style={{ width: 140 }}>
              <label>Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <label>Mật khẩu</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button type="submit">Tạo</button>
        </form>
      </div>
    </div>
  );
}
