import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const COLORS = {
  accent: "#4f6ef7",
  accentLight: "#e8ecff",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
};

const priorityConfig = {
  Critical: { bg: "#fee2e2", text: "#dc2626", dot: "#ef4444" },
  High: { bg: "#fef3c7", text: "#d97706", dot: "#f59e0b" },
  Medium: { bg: "#dbeafe", text: "#1d4ed8", dot: "#3b82f6" },
  Low: { bg: "#f0fdf4", text: "#15803d", dot: "#22c55e" },
};

const statusConfig = {
  "Completed": { bg: "#d1fae5", text: "#065f46" },
  "In Progress": { bg: "#dbeafe", text: "#1e40af" },
  "Pending": { bg: "#fef3c7", text: "#92400e" },
  "Under Review": { bg: "#ede9fe", text: "#5b21b6" },
  "On Hold": { bg: "#f1f5f9", text: "#475569" },
  "Cancelled": { bg: "#fee2e2", text: "#991b1b" },
};

function Badge({ label, config }) {
  const c = config || { bg: "#e2e8f0", text: "#475569" };
  return (
    <span style={{ background: c.bg, color: c.text, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap" }}>{label}</span>
  );
}

function StatCard({ label, value, sub, accent, icon, T }) {
  return (
    <div style={{ background: T.card, borderRadius: 16, padding: "20px 22px", border: `1px solid ${T.border}`, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 14, right: 14, fontSize: 22, opacity: 0.12 }}>{icon}</div>
      <div style={{ fontSize: 12, color: T.muted, fontWeight: 500, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: accent, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function DonutChart({ percent, label, color, T }) {
  const r = 30, circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke={T.border} strokeWidth="8" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ / 4}
          strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease" }} />
        <text x="40" y="44" textAnchor="middle" fontSize="13" fontWeight="700" fill={T.primary}>{percent}%</text>
      </svg>
      <span style={{ fontSize: 11, color: T.muted, textAlign: "center" }}>{label}</span>
    </div>
  );
}

function MiniBar({ data, T }) {
  const max = Math.max(...data.map(d => d.done + d.pending), 1);
  return (
    <div style={{ background: T.card, borderRadius: 16, padding: "20px 22px", border: `1px solid ${T.border}` }}>
      <div style={{ fontWeight: 600, fontSize: 14, color: T.primary, marginBottom: 16 }}>Task Overview by Status</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 100 }}>
        {data.map((d) => (
          <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 2, height: 80, justifyContent: "flex-end" }}>
              <div style={{ width: "100%", height: `${(d.pending / max) * 70}px`, background: "#fee2e2", borderRadius: "4px 4px 0 0", minHeight: d.pending > 0 ? 4 : 0 }} />
              <div style={{ width: "100%", height: `${(d.done / max) * 70}px`, background: COLORS.accent, borderRadius: "4px 4px 0 0", minHeight: d.done > 0 ? 4 : 0 }} />
            </div>
            <span style={{ fontSize: 9, color: T.muted, textAlign: "center" }}>{d.label}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: T.muted }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: COLORS.accent, display: "inline-block" }} />Completed
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: T.muted }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: "#fee2e2", display: "inline-block" }} />Pending
        </span>
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const T = {
    bg: darkMode ? "#0f172a" : "#f8faff",
    card: darkMode ? "#1e293b" : "#ffffff",
    border: darkMode ? "#334155" : "#e2e8f0",
    primary: darkMode ? "#f1f5f9" : "#1a1f36",
    muted: darkMode ? "#94a3b8" : "#64748b",
    hover: darkMode ? "#273549" : "#f8faff",
    accentLight: darkMode ? "#1e3a5f" : "#e8ecff",
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, notifRes] = await Promise.all([
        axios.get('/tasks'),
        axios.get('/notifications'),
      ]);
      setTasks(tasksRes.data);
      setNotifications(notifRes.data.slice(0, 5));
      if (user.role === 'admin' || user.role === 'manager') {
        const usersRes = await axios.get('/users');
        setUsers(usersRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data');
    }
    setLoading(false);
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "Completed").length;
  const inProgressTasks = tasks.filter(t => t.status === "In Progress").length;
  const pendingTasks = tasks.filter(t => t.status === "Pending").length;
  const overdueTasks = tasks.filter(t => t.status !== "Completed" && t.due_date && new Date(t.due_date) < new Date()).length;
  const completionRate = totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0;

  const barData = [
    { label: "Pending", done: 0, pending: pendingTasks },
    { label: "In Progress", done: inProgressTasks, pending: 0 },
    { label: "Completed", done: completedTasks, pending: 0 },
    { label: "Overdue", done: 0, pending: overdueTasks },
  ];

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const typeIcon = (type) => {
    if (type === 'task_assigned') return '📋';
    if (type === 'status_changed') return '🔄';
    return '🔔';
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <div style={{ fontSize: 14, color: T.muted }}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: T.primary }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user.name} 👋
        </h1>
        <p style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} — Here's your overview
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <StatCard label="Total Tasks" value={totalTasks} sub="All assigned tasks" accent={COLORS.accent} icon="✓" T={T} />
        <StatCard label="Completed" value={completedTasks} sub={`${completionRate}% completion rate`} accent={COLORS.success} icon="★" T={T} />
        <StatCard label="In Progress" value={inProgressTasks} sub="Active right now" accent={COLORS.warning} icon="◎" T={T} />
        <StatCard label="Overdue" value={overdueTasks} sub="Needs attention" accent={COLORS.danger} icon="⚠" T={T} />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14, marginBottom: 20 }}>
        <MiniBar data={barData} T={T} />
        <div style={{ background: T.card, borderRadius: 16, padding: "20px 22px", border: `1px solid ${T.border}` }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: T.primary, marginBottom: 16 }}>Performance</div>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <DonutChart percent={completionRate} label="Completion" color={COLORS.success} T={T} />
            <DonutChart percent={totalTasks > 0 ? Math.round((totalTasks - overdueTasks) / totalTasks * 100) : 100} label="On Time" color={COLORS.accent} T={T} />
            <DonutChart percent={totalTasks > 0 ? Math.round(inProgressTasks / totalTasks * 100) : 0} label="Active" color={COLORS.purple} T={T} />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 14 }}>
        {/* Recent Tasks */}
        <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: T.primary }}>Recent Tasks</span>
            <button onClick={() => onNavigate('tasks')} style={{ fontSize: 11, color: COLORS.accent, border: "none", background: "none", cursor: "pointer" }}>View all →</button>
          </div>
          {tasks.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", color: T.muted, fontSize: 13 }}>
              No tasks yet.{" "}
              <button onClick={() => onNavigate('tasks')} style={{ color: COLORS.accent, border: "none", background: "none", cursor: "pointer", fontSize: 13 }}>Create one →</button>
            </div>
          ) : (
            tasks.slice(0, 5).map(t => (
              <div key={t._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: `1px solid ${T.border}`, transition: "background 0.15s", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = T.hover}
                onMouseLeave={e => e.currentTarget.style.background = ""}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: priorityConfig[t.priority]?.dot || T.muted, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: T.primary }}>{t.title}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>
                    {Array.isArray(t.assigned_to) && t.assigned_to.length > 0
                      ? t.assigned_to.map(u => u?.name || '?').join(', ')
                      : 'Unassigned'} · {t.project || 'No project'}
                  </div>
                </div>
                <Badge label={t.status} config={statusConfig[t.status]} />
              </div>
            ))
          )}
        </div>

        {/* Notifications Feed */}
        <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: T.primary }}>Recent Notifications</span>
          </div>
          <div style={{ padding: "8px 0" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: T.muted, fontSize: 13 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                No notifications yet
              </div>
            ) : (
              notifications.map(n => (
                <div key={n._id} style={{
                  display: "flex", gap: 10, padding: "10px 16px", alignItems: "flex-start",
                  background: n.is_read ? "" : T.accentLight,
                  borderBottom: `1px solid ${T.border}`,
                }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{typeIcon(n.type)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: n.is_read ? 400 : 600, color: T.primary }}>{n.title}</div>
                    <div style={{ fontSize: 10, color: T.muted, marginTop: 2, lineHeight: 1.4 }}>{n.message}</div>
                    <div style={{ fontSize: 10, color: T.muted, marginTop: 3 }}>{timeAgo(n.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Team Overview - Admin/Manager only */}
      {(user.role === 'admin' || user.role === 'manager') && users.length > 0 && (
        <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, overflow: "hidden", marginTop: 14 }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: T.primary }}>Team Overview</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, padding: 16 }}>
            {users.slice(0, 6).map(u => {
              const userTasks = tasks.filter(t =>
                Array.isArray(t.assigned_to)
                  ? t.assigned_to.some(a => (a._id || a) === u._id)
                  : (t.assigned_to?._id || t.assigned_to) === u._id
              );
              const userCompleted = userTasks.filter(t => t.status === 'Completed').length;
              const rate = userTasks.length > 0 ? Math.round(userCompleted / userTasks.length * 100) : 0;
              const initials = u.name.split(' ').map(n => n[0]).join('').toUpperCase();
              return (
                <div key={u._id} style={{ background: T.bg, borderRadius: 12, padding: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "#fff" }}>{initials}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: T.primary }}>{u.name}</div>
                      <div style={{ fontSize: 10, color: T.muted, textTransform: "capitalize" }}>{u.role}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.muted, marginBottom: 5 }}>
                    <span>{userCompleted}/{userTasks.length} tasks</span>
                    <span style={{ fontWeight: 600, color: T.primary }}>{rate}%</span>
                  </div>
                  <div style={{ height: 5, background: T.border, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${rate}%`, background: COLORS.accent, borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
