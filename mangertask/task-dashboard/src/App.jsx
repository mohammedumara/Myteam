import { useState } from "react";
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import Login from './pages/Login';
import Users from './pages/Users';
import Tasks from './pages/Tasks';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Team from './pages/Team';
import Reports from './pages/Reports';
import NotificationBell from './components/NotificationBell';

const COLORS = {
  accent: "#4f6ef7",
  accentLight: "#e8ecff",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
};

const navItems = [
  { id: "dashboard", icon: "⊞", label: "Dashboard" },
  { id: "tasks", icon: "✓", label: "Tasks" },
  { id: "projects", icon: "◈", label: "Projects" },
  { id: "team", icon: "◉", label: "Team" },
  { id: "users", icon: "👥", label: "Users" },
  { id: "reports", icon: "▦", label: "Reports" },
  { id: "calendar", icon: "□", label: "Calendar" },
  { id: "settings", icon: "⚙", label: "Settings" },
];

function Avatar({ initials, color, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color || COLORS.accent,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.33, fontWeight: 600, color: "#fff",
      flexShrink: 0,
    }}>{initials}</div>
  );
}

export default function App() {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");

  // Theme colors
  const T = {
    bg: darkMode ? "#0f172a" : "#f8faff",
    card: darkMode ? "#1e293b" : "#ffffff",
    sidebar: darkMode ? "#020617" : "#0f172a",
    sidebarBorder: darkMode ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.07)",
    border: darkMode ? "#334155" : "#e2e8f0",
    primary: darkMode ? "#f1f5f9" : "#1a1f36",
    muted: darkMode ? "#94a3b8" : "#64748b",
    sidebarText: darkMode ? "#64748b" : "#94a3b8",
    input: darkMode ? "#0f172a" : "#f8faff",
    inputText: darkMode ? "#f1f5f9" : "#1a1f36",
    hover: darkMode ? "#273549" : "#f8faff",
  };

  if (!user) return <Login />;

  const userInitials = user.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase() : "U";

  return (
    <div style={{
      display: "flex", height: "100vh",
      background: T.bg,
      fontFamily: "'DM Sans', system-ui, sans-serif",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${darkMode ? '#475569' : '#cbd5e1'}; border-radius: 3px; }
        input, select, textarea { color-scheme: ${darkMode ? 'dark' : 'light'}; }
      `}</style>

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 220 : 64,
        background: T.sidebar,
        display: "flex", flexDirection: "column", flexShrink: 0,
        transition: "width 0.25s ease", overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>⊛</div>
          {sidebarOpen && <span style={{ fontWeight: 700, color: "#fff", fontSize: 15, whiteSpace: "nowrap" }}>TaskFlow</span>}
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(item => {
            if (item.id === "users" && user.role === "employee") return null;
            const isActive = activeNav === item.id;
            return (
              <button key={item.id} onClick={() => setActiveNav(item.id)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                borderRadius: 10, border: "none", cursor: "pointer",
                background: isActive ? "rgba(79,110,247,0.20)" : "transparent",
                color: isActive ? "#fff" : T.sidebarText,
                transition: "all 0.15s", width: "100%", textAlign: "left",
                fontSize: 13, fontWeight: isActive ? 600 : 400,
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
                {isActive && sidebarOpen && (
                  <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: COLORS.accent }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div style={{ padding: "16px 10px", borderTop: `1px solid ${T.sidebarBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px" }}>
            <Avatar initials={userInitials} color="#4f6ef7" size={32} />
            {sidebarOpen && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
                <div style={{ fontSize: 10, color: T.sidebarText, textTransform: "capitalize" }}>{user.role}</div>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button onClick={logout} style={{
              width: "100%", padding: "8px", marginTop: 4,
              background: "rgba(255,255,255,0.07)", border: "none",
              borderRadius: 8, color: T.sidebarText, fontSize: 12,
              cursor: "pointer", textAlign: "center",
              transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
            >Sign Out</button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{
          background: T.card,
          borderBottom: `1px solid ${T.border}`,
          padding: "0 24px", height: 60,
          display: "flex", alignItems: "center", gap: 16, flexShrink: 0,
        }}>
          <button onClick={() => setSidebarOpen(v => !v)} style={{
            border: "none", background: "none", cursor: "pointer",
            fontSize: 18, color: T.muted, padding: "4px 6px",
          }}>☰</button>

          <div style={{ flex: 1 }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks, people…"
              style={{
                width: 280, padding: "8px 14px", borderRadius: 10,
                border: `1px solid ${T.border}`, fontSize: 13,
                color: T.inputText, background: T.input, outline: "none",
              }} />
          </div>

          {/* Dark Mode Toggle */}
          <button onClick={toggleTheme} style={{
            border: `1px solid ${T.border}`,
            background: T.card, borderRadius: 10,
            padding: "7px 12px", cursor: "pointer",
            fontSize: 16, transition: "all 0.2s",
          }} title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            {darkMode ? "☀️" : "🌙"}
          </button>

          <NotificationBell />

          {(user.role === "admin" || user.role === "manager") && (
            <button onClick={() => setActiveNav("tasks")} style={{
              background: COLORS.accent, color: "#fff", border: "none",
              borderRadius: 10, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>+ New Task</button>
          )}

          <Avatar initials={userInitials} color="#4f6ef7" size={34} />
        </div>

        {/* Page Content */}
        <div style={{ flex: 1, overflow: "auto", padding: 24, background: T.bg }}>

          {activeNav === "dashboard" && <Dashboard onNavigate={setActiveNav} />}
          {activeNav === "tasks" && <Tasks />}
          {activeNav === "projects" && <Projects />}
          {activeNav === "team" && <Team />}
          {activeNav === "reports" && <Reports />}
          {activeNav === "users" && user.role !== "employee" && <Users />}

          {activeNav === "calendar" && (
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: T.primary, marginBottom: 20 }}>
                Calendar — {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h1>
              <div style={{ background: T.card, borderRadius: 16, padding: 20, border: `1px solid ${T.border}` }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                    <div key={d} style={{ textAlign: "center", fontSize: 11, color: T.muted, fontWeight: 600, padding: "6px 0" }}>{d}</div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                  {[...Array(35)].map((_, i) => {
                    const now = new Date();
                    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
                    const day = i - firstDay + 1;
                    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                    const isToday = day === now.getDate();
                    const isValid = day >= 1 && day <= daysInMonth;
                    return (
                      <div key={i} style={{
                        minHeight: 68, padding: "6px 8px", borderRadius: 8,
                        background: isToday ? (darkMode ? "#1e3a5f" : COLORS.accentLight) : isValid ? T.bg : "transparent",
                        border: `1px solid ${isToday ? COLORS.accent : isValid ? T.border : "transparent"}`,
                      }}>
                        {isValid && (
                          <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? COLORS.accent : T.primary }}>{day}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeNav === "settings" && (
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: T.primary, marginBottom: 20 }}>Settings</h1>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

                {/* Theme Settings */}
                <div style={{ background: T.card, borderRadius: 16, padding: "24px", border: `1px solid ${T.border}` }}>
                  <h2 style={{ fontSize: 14, fontWeight: 600, color: T.primary, marginBottom: 16 }}>Appearance</h2>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: T.primary }}>Dark Mode</div>
                      <div style={{ fontSize: 11, color: T.muted }}>Switch between light and dark theme</div>
                    </div>
                    <button onClick={toggleTheme} style={{
                      width: 48, height: 26, borderRadius: 13,
                      background: darkMode ? COLORS.accent : T.border,
                      border: "none", cursor: "pointer", position: "relative",
                      transition: "background 0.2s",
                    }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: "50%", background: "#fff",
                        position: "absolute", top: 3,
                        left: darkMode ? 25 : 3,
                        transition: "left 0.2s",
                      }} />
                    </button>
                  </div>
                </div>

                {/* Profile Settings */}
                <div style={{ background: T.card, borderRadius: 16, padding: "24px", border: `1px solid ${T.border}` }}>
                  <h2 style={{ fontSize: 14, fontWeight: 600, color: T.primary, marginBottom: 16 }}>Profile</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <Avatar initials={userInitials} color="#4f6ef7" size={48} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.primary }}>{user.name}</div>
                      <div style={{ fontSize: 12, color: T.muted }}>{user.email}</div>
                      <div style={{ fontSize: 11, color: COLORS.accent, textTransform: "capitalize", marginTop: 2 }}>{user.role}</div>
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div style={{ background: T.card, borderRadius: 16, padding: "24px", border: `1px solid ${T.border}` }}>
                  <h2 style={{ fontSize: 14, fontWeight: 600, color: T.primary, marginBottom: 16 }}>Notifications</h2>
                  {[
                    { label: "Task Assigned", desc: "Get notified when a task is assigned to you" },
                    { label: "Status Updates", desc: "Get notified when task status changes" },
                    { label: "Email Notifications", desc: "Receive notifications via email" },
                  ].map((n, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 2 ? `1px solid ${T.border}` : "none" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: T.primary }}>{n.label}</div>
                        <div style={{ fontSize: 11, color: T.muted }}>{n.desc}</div>
                      </div>
                      <div style={{ width: 36, height: 20, borderRadius: 10, background: COLORS.accent, position: "relative", cursor: "pointer" }}>
                        <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, right: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* System Info */}
                <div style={{ background: T.card, borderRadius: 16, padding: "24px", border: `1px solid ${T.border}` }}>
                  <h2 style={{ fontSize: 14, fontWeight: 600, color: T.primary, marginBottom: 16 }}>System Info</h2>
                  {[
                    { label: "Version", value: "1.0.0" },
                    { label: "Database", value: "MongoDB" },
                    { label: "Backend", value: "Node.js + Express" },
                    { label: "Frontend", value: "React + Vite" },
                  ].map((s, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 3 ? `1px solid ${T.border}` : "none" }}>
                      <span style={{ fontSize: 13, color: T.muted }}>{s.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: T.primary }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
