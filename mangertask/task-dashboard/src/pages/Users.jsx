import { useState, useEffect } from 'react';
import axios from '../api/axios';

const COLORS = {
  primary: "#1a1f36", accent: "#4f6ef7", accentLight: "#e8ecff",
  success: "#10b981", danger: "#ef4444", muted: "#64748b",
  border: "#e2e8f0", bg: "#f8faff", card: "#ffffff",
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'employee'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await axios.post('/auth/register', form);
      setMessage('User created successfully!');
      setForm({ name: '', email: '', password: '', role: 'employee' });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError('Failed to create user. Email may already exist.');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const roleColors = {
    admin: { bg: '#ede9fe', text: '#5b21b6' },
    manager: { bg: '#dbeafe', text: '#1e40af' },
    employee: { bg: '#d1fae5', text: '#065f46' },
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: COLORS.primary }}>User Management</h1>
        <button onClick={() => { setShowForm(!showForm); setError(''); setMessage(''); }} style={{
          background: COLORS.accent, color: '#fff', border: 'none',
          borderRadius: 10, padding: '8px 16px', fontSize: 12,
          fontWeight: 600, cursor: 'pointer',
        }}>
          {showForm ? '✕ Cancel' : '+ Add User'}
        </button>
      </div>

      {/* Success / Error messages */}
      {message && (
        <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px 16px', borderRadius: 10, marginBottom: 16, fontSize: 13 }}>
          ✓ {message}
        </div>
      )}
      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 16px', borderRadius: 10, marginBottom: 16, fontSize: 13 }}>
          ✕ {error}
        </div>
      )}

      {/* Create User Form */}
      {showForm && (
        <div style={{ background: COLORS.card, borderRadius: 16, padding: 24, border: `1px solid ${COLORS.border}`, marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: COLORS.primary, marginBottom: 20 }}>Create New User</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, display: 'block', marginBottom: 6 }}>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, display: 'block', marginBottom: 6 }}>Email</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: 'none'}}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, display: 'block', marginBottom: 6 }}>Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, display: 'block', marginBottom: 6 }}>Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: 'none', color: COLORS.primary, background: '#fff', cursor: 'pointer' }}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{
              background: COLORS.accent, color: '#fff', border: 'none',
              borderRadius: 10, padding: '10px 24px', fontSize: 13,
              fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div style={{ background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: COLORS.primary }}>All Users</span>
          <span style={{ fontSize: 12, color: COLORS.muted }}>{users.length} total</span>
        </div>

        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 120px 80px', padding: '10px 20px', background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}` }}>
          {['Name', 'Email', 'Role', 'Created', 'Action'].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
          ))}
        </div>

        {/* Table Rows */}
        {users.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: COLORS.muted, fontSize: 13 }}>No users found</div>
        ) : (
          users.map(u => (
            <div key={u._id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 120px 80px', alignItems: 'center', padding: '12px 20px', borderBottom: `1px solid ${COLORS.border}` }}
              onMouseEnter={e => e.currentTarget.style.background = COLORS.bg}
              onMouseLeave={e => e.currentTarget.style.background = ''}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: COLORS.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0,
                }}>
                  {u.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: COLORS.primary }}>{u.name}</span>
              </div>
              <div style={{ fontSize: 12, color: COLORS.muted }}>{u.email}</div>
              <span style={{
                background: roleColors[u.role]?.bg, color: roleColors[u.role]?.text,
                fontSize: 11, fontWeight: 600, padding: '3px 9px',
                borderRadius: 20, display: 'inline-block',
              }}>{u.role}</span>
              <div style={{ fontSize: 12, color: COLORS.muted }}>
                {new Date(u.createdAt).toLocaleDateString()}
              </div>
              <button onClick={() => handleDelete(u._id)} style={{
                background: '#fee2e2', color: '#dc2626', border: 'none',
                borderRadius: 8, padding: '5px 10px', fontSize: 11,
                cursor: 'pointer', fontWeight: 600,
              }}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}