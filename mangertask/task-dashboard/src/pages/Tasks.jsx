import { useState, useEffect } from 'react';
import axios from '../api/axios';

const COLORS = {
  primary: "#1a1f36", accent: "#4f6ef7", accentLight: "#e8ecff",
  success: "#10b981", danger: "#ef4444", warning: "#f59e0b",
  muted: "#64748b", border: "#e2e8f0", bg: "#f8faff", card: "#ffffff",
  purple: "#8b5cf6",
};

const priorityConfig = {
  Critical: { bg: "#fee2e2", text: "#dc2626", dot: "#ef4444" },
  High: { bg: "#fef3c7", text: "#d97706", dot: "#f59e0b" },
  Medium: { bg: "#dbeafe", text: "#1d4ed8", dot: "#3b82f6" },
  Low: { bg: "#f0fdf4", text: "#15803d", dot: "#22c55e" },
};

const statusConfig = {
  "Pending": { bg: "#fef3c7", text: "#92400e" },
  "In Progress": { bg: "#dbeafe", text: "#1e40af" },
  "Under Review": { bg: "#ede9fe", text: "#5b21b6" },
  "Completed": { bg: "#d1fae5", text: "#065f46" },
  "On Hold": { bg: "#f1f5f9", text: "#475569" },
  "Cancelled": { bg: "#fee2e2", text: "#991b1b" },
};

const kanbanCols = ["Pending", "In Progress", "Under Review", "Completed"];

const emptyForm = {
  title: '', description: '', assigned_to: [],
  priority: 'Medium', status: 'Pending',
  due_date: '', project: '', progress: 0,
};

function Badge({ label, config }) {
  const c = config || { bg: "#e2e8f0", text: "#475569" };
  return (
    <span style={{ background: c.bg, color: c.text, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap" }}>{label}</span>
  );
}

function Avatar({ initials, color, size = 32 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color || COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.33, fontWeight: 600, color: "#fff", flexShrink: 0 }}>{initials}</div>
  );
}

function TaskFormModal({ show, onClose, onSave, users, editTask }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editTask) {
      setForm({
        title: editTask.title || '',
        description: editTask.description || '',
        // assigned_to: editTask.assigned_to?._id || editTask.assigned_to || '',
        assigned_to: editTask.assigned_to ? editTask.assigned_to.map(u => u._id || u) : [],
        priority: editTask.priority || 'Medium',
        status: editTask.status || 'Pending',
        due_date: editTask.due_date ? editTask.due_date.slice(0, 10) : '',
        project: editTask.project || '',
        progress: editTask.progress || 0,
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [editTask, show]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editTask) {
        await axios.put(`/tasks/${editTask._id}`, form);
      } else {
        await axios.post('/tasks', form);
      }
      onSave();
      onClose();
    } catch (err) {
      setError('Failed to save task. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={onClose}>
      <div style={{ background: COLORS.card, borderRadius: 20, padding: "28px 30px", width: 540, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: COLORS.primary }}>{editTask ? 'Edit Task' : 'Create New Task'}</h2>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 20, color: COLORS.muted }}>✕</button>
        </div>

        {error && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, display: "block", marginBottom: 6 }}>Task Title *</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Enter task title" required
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none" }} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, display: "block", marginBottom: 6 }}>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Enter task description" rows={3}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none",  resize: "vertical" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

            {/* <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, display: "block", marginBottom: 6 }}>Assign To</label>
              <select value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none", color: COLORS.primary, background: "#fff", cursor: "pointer" }}>
                <option value="">Unassigned</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div> */}
            <div style={{ gridColumn: "1 / -1" }}>
  <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, display: "block", marginBottom: 6 }}>
    Assign To (select multiple)
  </label>
  {/* Selected users tags */}
  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
    {(form.assigned_to || []).map(uid => {
      const u = users.find(u => u._id === uid);
      if (!u) return null;
      const initials = u.name.split(' ').map(n => n[0]).join('').toUpperCase();
      return (
        <div key={uid} style={{ display: "flex", alignItems: "center", gap: 5, background: COLORS.accentLight, borderRadius: 20, padding: "4px 10px" }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>{initials}</div>
          <span style={{ fontSize: 11, color: COLORS.accent, fontWeight: 500 }}>{u.name}</span>
          <button type="button" onClick={() => setForm({ ...form, assigned_to: form.assigned_to.filter(id => id !== uid) })}
            style={{ border: "none", background: "none", cursor: "pointer", color: COLORS.accent, fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
        </div>
      );
    })}
  </div>
  {/* User selection dropdown */}
  <select
    onChange={e => {
      const val = e.target.value;
      if (val && !(form.assigned_to || []).includes(val)) {
        setForm({ ...form, assigned_to: [...(form.assigned_to || []), val] });
      }
      e.target.value = "";
    }}
    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none", color: COLORS.primary, background: "#fff", cursor: "pointer" }}>
    <option value="">+ Add team member...</option>
    {users.filter(u => !(form.assigned_to || []).includes(u._id)).map(u => (
      <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
    ))}
  </select>
</div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, display: "block", marginBottom: 6 }}>Project</label>
              <input type="text" value={form.project} onChange={e => setForm({ ...form, project: e.target.value })} placeholder="Project name"
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, display: "block", marginBottom: 6 }}>Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none", color: COLORS.primary, background: "#fff", cursor: "pointer" }}>
                {["Low", "Medium", "High", "Critical"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, display: "block", marginBottom: 6 }}>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none", color: COLORS.primary, background: "#fff", cursor: "pointer" }}>
                {["Pending", "In Progress", "Under Review", "Completed", "On Hold", "Cancelled"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, display: "block", marginBottom: 6 }}>Due Date</label>
              <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none", color: COLORS.primary }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, display: "block", marginBottom: 6 }}>Progress ({form.progress}%)</label>
              <input type="range" min="0" max="100" value={form.progress} onChange={e => setForm({ ...form, progress: parseInt(e.target.value) })}
                style={{ width: "100%", marginTop: 8 }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: "11px", background: COLORS.accent, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Saving...' : editTask ? 'Update Task' : 'Create Task'}
            </button>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "11px", background: COLORS.bg, color: COLORS.primary, border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 13, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function KanbanCard({ task, onEdit, onDelete, onStatusChange }) {
  const [dragging, setDragging] = useState(false);
  const assignees = Array.isArray(task.assigned_to) ? task.assigned_to : task.assigned_to ? [task.assigned_to] : [];

  return (
    <div draggable onDragStart={e => { setDragging(true); e.dataTransfer.setData('taskId', task._id); }}
      onDragEnd={() => setDragging(false)}
      style={{ background: COLORS.card, borderRadius: 12, padding: "14px", border: `1px solid ${COLORS.border}`, cursor: "grab", opacity: dragging ? 0.5 : 1, transition: "box-shadow 0.2s", boxShadow: dragging ? "0 8px 24px rgba(0,0,0,0.12)" : "none" }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.primary, marginBottom: 6 }}>{task.title}</div>
      {task.description && <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 8, lineHeight: 1.5 }}>{task.description.slice(0, 80)}{task.description.length > 80 ? '...' : ''}</div>}
      {task.project && <div style={{ fontSize: 10, color: COLORS.accent, marginBottom: 8, fontWeight: 500 }}>◈ {task.project}</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <Badge label={task.priority} config={priorityConfig[task.priority]} />
        <div style={{ display: "flex" }}>
  {assignees.slice(0, 3).map((u, i) => {
    const initials = u?.name ? u.name.split(' ').map(n => n[0]).join('') : '?';
    return <div key={i} style={{ marginLeft: i > 0 ? -6 : 0, zIndex: 3 - i }}>
      <Avatar initials={initials} size={24} />
    </div>;
  })}
  {assignees.length > 3 && <div style={{ width: 24, height: 24, borderRadius: "50%", background: COLORS.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: COLORS.muted, marginLeft: -6 }}>+{assignees.length - 3}</div>}
</div>
      </div>
      {task.due_date && (
        <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 8 }}>
          📅 {new Date(task.due_date).toLocaleDateString()}
        </div>
      )}
      <div style={{ height: 4, background: COLORS.border, borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
        <div style={{ height: "100%", width: `${task.progress}%`, background: task.progress === 100 ? COLORS.success : COLORS.accent, borderRadius: 4 }} />
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => onEdit(task)} style={{ flex: 1, padding: "5px", background: COLORS.accentLight, color: COLORS.accent, border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 500 }}>Edit</button>
        <button onClick={() => onDelete(task._id)} style={{ flex: 1, padding: "5px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 500 }}>Delete</button>
      </div>
    </div>
  );
}

function KanbanColumn({ col, tasks, onEdit, onDelete, onStatusChange }) {
  const s = statusConfig[col] || {};
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) onStatusChange(taskId, col);
  };

  return (
    <div style={{ flex: 1, minWidth: 220 }}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, padding: "8px 12px", background: dragOver ? COLORS.accentLight : COLORS.bg, borderRadius: 10, border: `1px solid ${dragOver ? COLORS.accent : COLORS.border}`, transition: "all 0.2s" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.text, display: "inline-block" }} />
        <span style={{ fontWeight: 600, fontSize: 12, color: COLORS.primary }}>{col}</span>
        <span style={{ background: COLORS.border, color: COLORS.muted, fontSize: 10, borderRadius: 20, padding: "1px 7px", marginLeft: "auto" }}>{tasks.length}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 100 }}>
        {tasks.map(t => <KanbanCard key={t._id} task={t} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} />)}
        {tasks.length === 0 && (
          <div style={{ padding: 20, border: `1.5px dashed ${dragOver ? COLORS.accent : COLORS.border}`, borderRadius: 10, textAlign: "center", fontSize: 11, color: COLORS.muted }}>
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [activeTab, setActiveTab] = useState('kanban');
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks');
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const task = tasks.find(t => t._id === taskId);
      if (!task) return;
      await axios.put(`/tasks/${taskId}`, { ...task, status: newStatus, assigned_to: task.assigned_to?._id || task.assigned_to });
      fetchTasks();
    } catch (err) {
      console.error('Failed to update status');
    }
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setShowForm(true);
  };

  const filtered = tasks.filter(t => {
    const matchSearch = t.title?.toLowerCase().includes(search.toLowerCase()) || t.project?.toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === 'All' || t.priority === filterPriority;
    const matchStatus = filterStatus === 'All' || t.status === filterStatus;
    return matchSearch && matchPriority && matchStatus;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: COLORS.primary }}>Tasks</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {["kanban", "list"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 500, border: `1px solid ${activeTab === t ? COLORS.accent : COLORS.border}`, background: activeTab === t ? COLORS.accentLight : COLORS.card, color: activeTab === t ? COLORS.accent : COLORS.muted, cursor: "pointer" }}>
              {t === "kanban" ? "⊞ Board" : "☰ List"}
            </button>
          ))}
          <button onClick={() => { setEditTask(null); setShowForm(true); }} style={{ background: COLORS.accent, color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            + New Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
          style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none", color: COLORS.primary, width: 200 }} />
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 12, background: COLORS.card, color: COLORS.primary, cursor: "pointer", outline: "none" }}>
          {["All", "Critical", "High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 12, background: COLORS.card, color: COLORS.primary, cursor: "pointer", outline: "none" }}>
          {["All", "Pending", "In Progress", "Under Review", "Completed", "On Hold"].map(s => <option key={s}>{s}</option>)}
        </select>
        <span style={{ fontSize: 12, color: COLORS.muted, alignSelf: "center" }}>{filtered.length} tasks</span>
      </div>

      {/* Loading */}
      {loading && <div style={{ textAlign: "center", padding: 40, color: COLORS.muted }}>Loading tasks...</div>}

      {/* Kanban Board */}
      {!loading && activeTab === "kanban" && (
        <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 16 }}>
          {kanbanCols.map(col => (
            <KanbanColumn key={col} col={col} tasks={filtered.filter(t => t.status === col)}
              onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}

      {/* List View */}
      {!loading && activeTab === "list" && (
        <div style={{ background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 90px 100px 90px 80px 100px", padding: "10px 16px", background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}` }}>
            {["Task", "Assignee", "Priority", "Status", "Project", "Progress", "Actions"].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
            ))}
          </div>
          {filtered.length === 0 && <div style={{ padding: 40, textAlign: "center", color: COLORS.muted, fontSize: 13 }}>No tasks found. Create your first task!</div>}
          {filtered.map(t => (
            <div key={t._id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 90px 100px 90px 80px 100px", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${COLORS.border}` }}
              onMouseEnter={e => e.currentTarget.style.background = COLORS.bg}
              onMouseLeave={e => e.currentTarget.style.background = ""}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13, color: COLORS.primary }}>{t.title}</div>
                {t.description && <div style={{ fontSize: 11, color: COLORS.muted }}>{t.description.slice(0, 40)}...</div>}
              </div>
              <div style={{ fontSize: 12, color: COLORS.muted }}>
  {Array.isArray(t.assigned_to) && t.assigned_to.length > 0
    ? t.assigned_to.map(u => u?.name).join(', ')
    : 'Unassigned'}
</div>
              <Badge label={t.priority} config={priorityConfig[t.priority]} />
              <Badge label={t.status} config={statusConfig[t.status]} />
              <div style={{ fontSize: 12, color: COLORS.muted }}>{t.project || '-'}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ flex: 1, height: 4, background: COLORS.border, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${t.progress}%`, background: t.progress === 100 ? COLORS.success : COLORS.accent, borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 10, color: COLORS.muted }}>{t.progress}%</span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => handleEdit(t)} style={{ padding: "4px 8px", background: COLORS.accentLight, color: COLORS.accent, border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 500 }}>Edit</button>
                <button onClick={() => handleDelete(t._id)} style={{ padding: "4px 8px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 500 }}>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Form Modal */}
      <TaskFormModal
        show={showForm}
        onClose={() => { setShowForm(false); setEditTask(null); }}
        onSave={fetchTasks}
        users={users}
        editTask={editTask}
      />
    </div>
  );
}