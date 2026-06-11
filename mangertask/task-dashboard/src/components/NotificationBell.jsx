import { useState, useEffect, useRef } from 'react';
import axios from '../api/axios';

const COLORS = {
  primary: "#1a1f36", accent: "#4f6ef7", accentLight: "#e8ecff",
  success: "#10b981", danger: "#ef4444", muted: "#64748b",
  border: "#e2e8f0", bg: "#f8faff", card: "#ffffff",
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get('/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error('Failed to fetch unread count');
    }
  };

  const handleOpen = () => {
    setOpen(!open);
    if (!open) fetchNotifications();
  };

  const markAllRead = async () => {
    try {
      await axios.put('/notifications/mark-all-read');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const markOneRead = async (id) => {
    try {
      await axios.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const typeIcon = (type) => {
    if (type === 'task_assigned') return '📋';
    if (type === 'status_changed') return '🔄';
    return '🔔';
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell Button */}
      <button onClick={handleOpen} style={{
        position: "relative", border: "none", background: "none",
        cursor: "pointer", fontSize: 20, color: COLORS.muted, padding: "4px 6px",
      }}>
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: -2, right: -2,
            background: COLORS.danger, color: "#fff",
            fontSize: 9, fontWeight: 700, borderRadius: 10,
            padding: "1px 5px", minWidth: 16, textAlign: "center",
          }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: 40, right: 0,
          width: 340, background: COLORS.card,
          borderRadius: 16, border: `1px solid ${COLORS.border}`,
          boxShadow: "0 10px 40px rgba(0,0,0,0.12)", zIndex: 200,
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 16px", borderBottom: `1px solid ${COLORS.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.primary }}>Notifications</span>
              {unreadCount > 0 && (
                <span style={{ background: COLORS.danger, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "1px 7px", marginLeft: 8 }}>{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ fontSize: 11, color: COLORS.accent, border: "none", background: "none", cursor: "pointer", fontWeight: 500 }}>
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 30, textAlign: "center", color: COLORS.muted, fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                No notifications yet
              </div>
            ) : (
              notifications.map(n => (
                <div key={n._id} onClick={() => !n.is_read && markOneRead(n._id)}
                  style={{
                    padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}`,
                    background: n.is_read ? COLORS.card : COLORS.accentLight,
                    cursor: n.is_read ? "default" : "pointer",
                    transition: "background 0.15s",
                    display: "flex", gap: 10, alignItems: "flex-start",
                  }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{typeIcon(n.type)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: n.is_read ? 400 : 600, color: COLORS.primary, marginBottom: 3 }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.5 }}>{n.message}</div>
                    <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 4 }}>{timeAgo(n.createdAt)}</div>
                  </div>
                  {!n.is_read && (
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.accent, flexShrink: 0, marginTop: 4 }} />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{ padding: "10px 16px", borderTop: `1px solid ${COLORS.border}`, textAlign: "center" }}>
              <button onClick={fetchNotifications} style={{ fontSize: 12, color: COLORS.accent, border: "none", background: "none", cursor: "pointer" }}>
                Refresh
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}