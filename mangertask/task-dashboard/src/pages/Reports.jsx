import { useState, useEffect } from 'react';
import axios from '../api/axios';

const COLORS = {
  primary: "#1a1f36", accent: "#4f6ef7", accentLight: "#e8ecff",
  success: "#10b981", warning: "#f59e0b", danger: "#ef4444",
  purple: "#8b5cf6", muted: "#64748b", border: "#e2e8f0",
  bg: "#f8faff", card: "#ffffff",
};

const statusConfig = {
  "Completed": { bg: "#d1fae5", text: "#065f46", color: "#10b981" },
  "In Progress": { bg: "#dbeafe", text: "#1e40af", color: "#4f6ef7" },
  "Pending": { bg: "#fef3c7", text: "#92400e", color: "#f59e0b" },
  "Under Review": { bg: "#ede9fe", text: "#5b21b6", color: "#8b5cf6" },
  "On Hold": { bg: "#f1f5f9", text: "#475569", color: "#94a3b8" },
  "Cancelled": { bg: "#fee2e2", text: "#991b1b", color: "#ef4444" },
};

const priorityConfig = {
  Critical: { color: "#ef4444", bg: "#fee2e2", text: "#dc2626" },
  High: { color: "#f59e0b", bg: "#fef3c7", text: "#d97706" },
  Medium: { color: "#4f6ef7", bg: "#dbeafe", text: "#1d4ed8" },
  Low: { color: "#10b981", bg: "#f0fdf4", text: "#15803d" },
};

function DonutChart({ data, size = 140 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return <div style={{ width: size, height: size, borderRadius: "50%", background: COLORS.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: COLORS.muted }}>No data</div>;

  let cumulative = 0;
  const segments = data.map(d => {
    const start = cumulative;
    cumulative += d.value / total;
    return { ...d, start, end: cumulative };
  });

  const r = size / 2 - 16;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((s, i) => {
        const dash = (s.end - s.start) * circ;
        const offset = circ - s.start * circ;
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth="16"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={offset}
            strokeLinecap="butt" />
        );
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="700" fill={COLORS.primary}>{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill={COLORS.muted}>Total</text>
    </svg>
  );
}

function BarChart({ data, color = COLORS.accent }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.primary }}>{d.value}</span>
          <div style={{ width: "100%", height: `${(d.value / max) * 90}px`, background: color, borderRadius: "4px 4px 0 0", minHeight: d.value > 0 ? 4 : 0, transition: "height 0.5s ease" }} />
          <span style={{ fontSize: 9, color: COLORS.muted, textAlign: "center", lineHeight: 1.2 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Reports() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, usersRes] = await Promise.all([
        axios.get('/tasks'),
        axios.get('/users'),
      ]);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to fetch reports data');
    }
    setLoading(false);
  };

  // Filter tasks by date
  const filteredTasks = tasks.filter(t => {
    if (dateFilter === 'all') return true;
    const created = new Date(t.createdAt);
    const now = new Date();
    if (dateFilter === 'today') return created.toDateString() === now.toDateString();
    if (dateFilter === 'week') return (now - created) / (1000 * 60 * 60 * 24) <= 7;
    if (dateFilter === 'month') return (now - created) / (1000 * 60 * 60 * 24) <= 30;
    return true;
  });

  // Stats
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.status === 'Completed').length;
  const completionRate = totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0;
  const overdueTasks = filteredTasks.filter(t => t.status !== 'Completed' && t.due_date && new Date(t.due_date) < new Date()).length;
  const onTimeRate = totalTasks > 0 ? Math.round((totalTasks - overdueTasks) / totalTasks * 100) : 100;

  // Avg completion time
  const completedWithDates = filteredTasks.filter(t => t.status === 'Completed' && t.createdAt && t.updatedAt);
  const avgDays = completedWithDates.length > 0
    ? (completedWithDates.reduce((sum, t) => sum + (new Date(t.updatedAt) - new Date(t.createdAt)) / (1000 * 60 * 60 * 24), 0) / completedWithDates.length).toFixed(1)
    : 0;

  // Status distribution
  const statusData = Object.keys(statusConfig).map(s => ({
    label: s, value: filteredTasks.filter(t => t.status === s).length,
    color: statusConfig[s].color, bg: statusConfig[s].bg, text: statusConfig[s].text,
  }));

  // Priority distribution
  const priorityData = Object.keys(priorityConfig).map(p => ({
    label: p, value: filteredTasks.filter(t => t.priority === p).length,
    color: priorityConfig[p].color,
  }));

  // Top performers
  const topPerformers = users.map(u => {
    const userTasks = filteredTasks.filter(t =>
      Array.isArray(t.assigned_to)
        ? t.assigned_to.some(a => (a._id || a) === u._id)
        : (t.assigned_to?._id || t.assigned_to) === u._id
    );
    const completed = userTasks.filter(t => t.status === 'Completed').length;
    const rate = userTasks.length > 0 ? Math.round(completed / userTasks.length * 100) : 0;
    return { ...u, totalTasks: userTasks.length, completedTasks: completed, rate };
  }).sort((a, b) => b.rate - a.rate);

  // Project stats
  const projects = [...new Set(filteredTasks.map(t => t.project).filter(Boolean))];
  const projectStats = projects.map(p => {
    const pTasks = filteredTasks.filter(t => t.project === p);
    const completed = pTasks.filter(t => t.status === 'Completed').length;
    const progress = pTasks.length > 0 ? Math.round(completed / pTasks.length * 100) : 0;
    return { name: p, total: pTasks.length, completed, progress };
  }).sort((a, b) => b.total - a.total);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
      <div style={{ fontSize: 14, color: COLORS.muted }}>Loading reports...</div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: COLORS.primary }}>Reports & Analytics</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "All Time", value: "all" },
            { label: "Today", value: "today" },
            { label: "This Week", value: "week" },
            { label: "This Month", value: "month" },
          ].map(f => (
            <button key={f.value} onClick={() => setDateFilter(f.value)} style={{
              padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
              border: `1px solid ${dateFilter === f.value ? COLORS.accent : COLORS.border}`,
              background: dateFilter === f.value ? COLORS.accentLight : COLORS.card,
              color: dateFilter === f.value ? COLORS.accent : COLORS.muted,
              cursor: "pointer",
            }}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Total Tasks", value: totalTasks, sub: "In selected period", color: COLORS.accent, icon: "✓" },
          { label: "Completion Rate", value: `${completionRate}%`, sub: `${completedTasks} tasks done`, color: COLORS.success, icon: "★" },
          { label: "On Time Rate", value: `${onTimeRate}%`, sub: `${overdueTasks} overdue`, color: COLORS.warning, icon: "⏱" },
          { label: "Avg. Completion", value: `${avgDays}d`, sub: "Days to complete", color: COLORS.purple, icon: "◎" },
        ].map(k => (
          <div key={k.label} style={{ background: COLORS.card, borderRadius: 16, padding: "20px 22px", border: `1px solid ${COLORS.border}`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 14, right: 14, fontSize: 20, opacity: 0.1 }}>{k.icon}</div>
            <div style={{ fontSize: 11, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: k.color, lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 6 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>

        {/* Status Distribution */}
        <div style={{ background: COLORS.card, borderRadius: 16, padding: "20px 22px", border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.primary, marginBottom: 20 }}>Task Status Distribution</div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <DonutChart data={statusData.filter(s => s.value > 0)} size={140} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {statusData.map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: COLORS.muted, flex: 1 }}>{s.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary }}>{s.value}</span>
                  <span style={{ fontSize: 11, color: COLORS.muted }}>{totalTasks > 0 ? Math.round(s.value / totalTasks * 100) : 0}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div style={{ background: COLORS.card, borderRadius: 16, padding: "20px 22px", border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.primary, marginBottom: 20 }}>Priority Breakdown</div>
          <BarChart data={priorityData} color={COLORS.accent} />
          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            {priorityData.map(p => (
              <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
                <span style={{ fontSize: 11, color: COLORS.muted }}>{p.label}: {p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers & Project Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>

        {/* Top Performers */}
        <div style={{ background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: COLORS.primary }}>Top Performers</span>
          </div>
          {topPerformers.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", color: COLORS.muted, fontSize: 13 }}>No data yet</div>
          ) : (
            topPerformers.slice(0, 5).map((u, i) => {
              const initials = u.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
              return (
                <div key={u._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: i === 0 ? COLORS.warning : COLORS.muted, minWidth: 20 }}>#{i + 1}</div>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>{initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.primary }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: COLORS.muted }}>{u.completedTasks}/{u.totalTasks} tasks</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: u.rate >= 70 ? COLORS.success : u.rate >= 40 ? COLORS.warning : COLORS.danger }}>{u.rate}%</div>
                    <div style={{ width: 60, height: 4, background: COLORS.border, borderRadius: 4, overflow: "hidden", marginTop: 4 }}>
                      <div style={{ height: "100%", width: `${u.rate}%`, background: u.rate >= 70 ? COLORS.success : u.rate >= 40 ? COLORS.warning : COLORS.danger, borderRadius: 4 }} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Project Stats */}
        <div style={{ background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: COLORS.primary }}>Project Progress</span>
          </div>
          {projectStats.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", color: COLORS.muted, fontSize: 13 }}>No projects with tasks yet</div>
          ) : (
            projectStats.map((p, i) => (
              <div key={i} style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.primary }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: COLORS.muted }}>{p.completed}/{p.total} tasks</div>
                </div>
                <div style={{ height: 6, background: COLORS.border, borderRadius: 4, overflow: "hidden", marginBottom: 4 }}>
                  <div style={{ height: "100%", width: `${p.progress}%`, background: p.progress === 100 ? COLORS.success : COLORS.accent, borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 11, color: COLORS.muted }}>{p.progress}% complete</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div style={{ background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: COLORS.primary }}>Task Summary</span>
          <span style={{ fontSize: 12, color: COLORS.muted }}>{filteredTasks.length} tasks</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 90px 100px 80px", padding: "10px 20px", background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}` }}>
          {["Task", "Assignee", "Priority", "Status", "Progress"].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
          ))}
        </div>
        {filteredTasks.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: COLORS.muted, fontSize: 13 }}>No tasks found</div>
        ) : (
          filteredTasks.slice(0, 10).map(t => (
            <div key={t._id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 90px 100px 80px", alignItems: "center", padding: "12px 20px", borderBottom: `1px solid ${COLORS.border}` }}
              onMouseEnter={e => e.currentTarget.style.background = COLORS.bg}
              onMouseLeave={e => e.currentTarget.style.background = ""}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.primary }}>{t.title}</div>
                <div style={{ fontSize: 11, color: COLORS.muted }}>{t.project || 'No project'}</div>
              </div>
              <div style={{ fontSize: 12, color: COLORS.muted }}>
                {Array.isArray(t.assigned_to) && t.assigned_to.length > 0
                  ? t.assigned_to.map(u => u?.name || '?').join(', ')
                  : 'Unassigned'}
              </div>
              <span style={{ background: priorityConfig[t.priority]?.bg, color: priorityConfig[t.priority]?.text, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20 }}>{t.priority}</span>
              <span style={{ background: statusConfig[t.status]?.bg, color: statusConfig[t.status]?.text, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20 }}>{t.status}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ flex: 1, height: 4, background: COLORS.border, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${t.progress}%`, background: t.progress === 100 ? COLORS.success : COLORS.accent, borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 10, color: COLORS.muted }}>{t.progress}%</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Export Buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        {["Export PDF", "Export Excel", "Email Report"].map(btn => (
          <button key={btn} style={{ padding: "10px 20px", border: `1px solid ${COLORS.border}`, borderRadius: 10, background: COLORS.card, fontSize: 12, color: COLORS.primary, cursor: "pointer", fontWeight: 500 }}>{btn}</button>
        ))}
        <button onClick={fetchData} style={{ padding: "10px 20px", border: `1px solid ${COLORS.accent}`, borderRadius: 10, background: COLORS.accentLight, fontSize: 12, color: COLORS.accent, cursor: "pointer", fontWeight: 600 }}>↻ Refresh</button>
      </div>
    </div>
  );
}