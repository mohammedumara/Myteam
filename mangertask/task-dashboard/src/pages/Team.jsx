import { useState, useEffect } from 'react';
import axios from '../api/axios';

const COLORS = {
  primary: "#1a1f36", accent: "#4f6ef7", accentLight: "#e8ecff",
  success: "#10b981", warning: "#f59e0b", danger: "#ef4444",
  purple: "#8b5cf6", muted: "#64748b", border: "#e2e8f0",
  bg: "#f8faff", card: "#ffffff",
};

const roleColors = {
  admin: { bg: "#ede9fe", text: "#5b21b6", dot: "#8b5cf6" },
  manager: { bg: "#dbeafe", text: "#1e40af", dot: "#4f6ef7" },
  employee: { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
};

const avatarColors = [
  "#4f6ef7", "#8b5cf6", "#10b981", "#f59e0b",
  "#ef4444", "#0891b2", "#dc2626", "#7c3aed",
];

export default function Team() {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, tasksRes] = await Promise.all([
        axios.get('/users'),
        axios.get('/tasks'),
      ]);
      setUsers(usersRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error('Failed to fetch team data');
    }
    setLoading(false);
  };

  const getUserStats = (userId) => {
    const userTasks = tasks.filter(t =>
      Array.isArray(t.assigned_to)
        ? t.assigned_to.some(u => (u._id || u) === userId)
        : (t.assigned_to?._id || t.assigned_to) === userId
    );
    const completed = userTasks.filter(t => t.status === 'Completed').length;
    const inProgress = userTasks.filter(t => t.status === 'In Progress').length;
    const pending = userTasks.filter(t => t.status === 'Pending').length;
    const rate = userTasks.length > 0 ? Math.round(completed / userTasks.length * 100) : 0;
    return { total: userTasks.length, completed, inProgress, pending, rate, tasks: userTasks };
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'All' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
      <div style={{ fontSize: 14, color: COLORS.muted }}>Loading team...</div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: COLORS.primary }}>Team</h1>
        <div style={{ fontSize: 13, color: COLORS.muted }}>{users.length} members</div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Total Members", value: users.length, color: COLORS.accent },
          { label: "Admins", value: users.filter(u => u.role === 'admin').length, color: COLORS.purple },
          { label: "Managers", value: users.filter(u => u.role === 'manager').length, color: COLORS.warning },
          { label: "Employees", value: users.filter(u => u.role === 'employee').length, color: COLORS.success },
        ].map(s => (
          <div key={s.label} style={{ background: COLORS.card, borderRadius: 14, padding: "16px 20px", border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 11, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search members..."
          style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none", color: COLORS.primary, width: 220 }} />
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 12, background: COLORS.card, color: COLORS.primary, cursor: "pointer", outline: "none" }}>
          {["All", "admin", "manager", "employee"].map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      {/* Team Grid */}
      {filtered.length === 0 ? (
        <div style={{ background: COLORS.card, borderRadius: 16, padding: 60, textAlign: "center", border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>◉</div>
          <div style={{ fontSize: 14, color: COLORS.muted }}>No team members found</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {filtered.map((u, idx) => {
            const stats = getUserStats(u._id);
            const initials = u.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
            const avatarColor = avatarColors[idx % avatarColors.length];
            return (
              <div key={u._id}
                onClick={() => setSelectedUser(selectedUser?._id === u._id ? null : u)}
                style={{ background: COLORS.card, borderRadius: 16, padding: "20px", border: `1px solid ${selectedUser?._id === u._id ? COLORS.accent : COLORS.border}`, cursor: "pointer", transition: "all 0.2s", boxShadow: selectedUser?._id === u._id ? "0 4px 20px rgba(79,110,247,0.15)" : "none" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = selectedUser?._id === u._id ? "0 4px 20px rgba(79,110,247,0.15)" : "none"}>

                {/* Avatar & Info */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: avatarColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: COLORS.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: COLORS.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                  </div>
                  <span style={{ background: roleColors[u.role]?.bg, color: roleColors[u.role]?.text, fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20, flexShrink: 0, textTransform: "capitalize" }}>{u.role}</span>
                </div>

                {/* Task Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
                  {[
                    { label: "Total", value: stats.total, color: COLORS.accent },
                    { label: "Done", value: stats.completed, color: COLORS.success },
                    { label: "Active", value: stats.inProgress, color: COLORS.warning },
                  ].map(s => (
                    <div key={s.label} style={{ background: COLORS.bg, borderRadius: 10, padding: "8px", textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: COLORS.muted }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Progress Bar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.muted, marginBottom: 5 }}>
                    <span>Completion rate</span>
                    <span style={{ fontWeight: 600, color: COLORS.primary }}>{stats.rate}%</span>
                  </div>
                  <div style={{ height: 6, background: COLORS.border, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${stats.rate}%`, background: avatarColor, borderRadius: 4, transition: "width 0.5s ease" }} />
                  </div>
                </div>

                {/* Joined date */}
                <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 10 }}>
                  Joined: {new Date(u.createdAt).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* User Task Detail Panel */}
      {selectedUser && (() => {
        const stats = getUserStats(selectedUser._id);
        return (
          <div style={{ marginTop: 20, background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: COLORS.primary }}>{selectedUser.name}'s Tasks ({stats.total})</span>
              <button onClick={() => setSelectedUser(null)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, color: COLORS.muted }}>✕</button>
            </div>
            {stats.tasks.length === 0 ? (
              <div style={{ padding: 30, textAlign: "center", color: COLORS.muted, fontSize: 13 }}>No tasks assigned yet</div>
            ) : (
              stats.tasks.map(t => (
                <div key={t._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: `1px solid ${COLORS.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.bg}
                  onMouseLeave={e => e.currentTarget.style.background = ""}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.status === 'Completed' ? COLORS.success : t.status === 'In Progress' ? COLORS.accent : COLORS.warning, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.primary }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: COLORS.muted }}>{t.project || 'No project'} · Due: {t.due_date ? new Date(t.due_date).toLocaleDateString() : 'Not set'}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: t.status === 'Completed' ? "#d1fae5" : t.status === 'In Progress' ? "#dbeafe" : "#fef3c7", color: t.status === 'Completed' ? "#065f46" : t.status === 'In Progress' ? "#1e40af" : "#92400e" }}>{t.status}</span>
                  <div style={{ fontSize: 11, color: COLORS.muted, minWidth: 35 }}>{t.progress}%</div>
                </div>
              ))
            )}
          </div>
        );
      })()}
    </div>
  );
}