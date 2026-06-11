import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  primary: "#1a1f36", accent: "#4f6ef7", accentLight: "#e8ecff",
  success: "#10b981", warning: "#f59e0b", danger: "#ef4444",
  purple: "#8b5cf6", muted: "#64748b", border: "#e2e8f0",
  bg: "#f8faff", card: "#ffffff",
};

const statusConfig = {
  Planning: { bg: "#fef3c7", text: "#92400e" },
  Active: { bg: "#dbeafe", text: "#1e40af" },
  Delayed: { bg: "#fee2e2", text: "#dc2626" },
  Completed: { bg: "#d1fae5", text: "#065f46" },
  Cancelled: { bg: "#f1f5f9", text: "#475569" },
};

const colorOptions = [
  "#4f6ef7", "#8b5cf6", "#10b981", "#f59e0b",
  "#ef4444", "#0891b2", "#dc2626", "#7c3aed",
];

const emptyForm = {
  name: '', description: '', status: 'Active',
  start_date: '', end_date: '', color: '#4f6ef7', members: [],
};

function ProjectFormModal({ show, onClose, onSave, users, editProject }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editProject) {
      setForm({
        name: editProject.name || '',
        description: editProject.description || '',
        status: editProject.status || 'Active',
        start_date: editProject.start_date ? editProject.start_date.slice(0, 10) : '',
        end_date: editProject.end_date ? editProject.end_date.slice(0, 10) : '',
        color: editProject.color || '#4f6ef7',
        members: editProject.members ? editProject.members.map(m => m._id || m) : [],
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [editProject, show]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editProject) {
        await axios.put(`/projects/${editProject._id}`, form);
      } else {
        await axios.post('/projects', form);
      }
      onSave();
      onClose();
    } catch (err) {
      setError('Failed to save project.');
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={onClose}>
      <div style={{ background: COLORS.card, borderRadius: 20, padding: "28px 30px", width: 540, maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: COLORS.primary }}>{editProject ? 'Edit Project' : 'Create New Project'}</h2>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 20, color: COLORS.muted }}>✕</button>
        </div>

        {error && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, display: "block", marginBottom: 6 }}>Project Name *</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Enter project name" required
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none", color: COLORS.primary }} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, display: "block", marginBottom: 6 }}>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Project description" rows={3}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none", color: COLORS.primary, resize: "vertical" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, display: "block", marginBottom: 6 }}>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none", color: COLORS.primary, background: "#fff", cursor: "pointer" }}>
                {["Planning", "Active", "Delayed", "Completed", "Cancelled"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, display: "block", marginBottom: 6 }}>Color</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                {colorOptions.map(c => (
                  <div key={c} onClick={() => setForm({ ...form, color: c })}
                    style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer", border: form.color === c ? "3px solid #1a1f36" : "3px solid transparent", transition: "border 0.15s" }} />
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, display: "block", marginBottom: 6 }}>Start Date</label>
              <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none", color: COLORS.primary }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, display: "block", marginBottom: 6 }}>End Date</label>
              <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none", color: COLORS.primary }} />
            </div>
          </div>

          {/* Members */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary, display: "block", marginBottom: 6 }}>Team Members</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {(form.members || []).map(uid => {
                const u = users.find(u => u._id === uid);
                if (!u) return null;
                const initials = u.name.split(' ').map(n => n[0]).join('').toUpperCase();
                return (
                  <div key={uid} style={{ display: "flex", alignItems: "center", gap: 5, background: COLORS.accentLight, borderRadius: 20, padding: "4px 10px" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>{initials}</div>
                    <span style={{ fontSize: 11, color: COLORS.accent, fontWeight: 500 }}>{u.name}</span>
                    <button type="button" onClick={() => setForm({ ...form, members: form.members.filter(id => id !== uid) })}
                      style={{ border: "none", background: "none", cursor: "pointer", color: COLORS.accent, fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                  </div>
                );
              })}
            </div>
            <select onChange={e => {
              const val = e.target.value;
              if (val && !form.members.includes(val)) {
                setForm({ ...form, members: [...form.members, val] });
              }
              e.target.value = "";
            }}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: "none", color: COLORS.primary, background: "#fff", cursor: "pointer" }}>
              <option value="">+ Add team member...</option>
              {users.filter(u => !form.members.includes(u._id)).map(u => (
                <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: "11px", background: COLORS.accent, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Saving...' : editProject ? 'Update Project' : 'Create Project'}
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

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState(null);

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to fetch projects');
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
    if (!window.confirm('Delete this project?')) return;
    try {
      await axios.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  const handleEdit = (project) => {
    setEditProject(project);
    setShowForm(true);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: COLORS.primary }}>Projects</h1>
        {user.role !== 'employee' && (
          <button onClick={() => { setEditProject(null); setShowForm(true); }} style={{
            background: COLORS.accent, color: "#fff", border: "none",
            borderRadius: 10, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>+ New Project</button>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Total", value: projects.length, color: COLORS.accent },
          { label: "Active", value: projects.filter(p => p.status === 'Active').length, color: COLORS.success },
          { label: "Completed", value: projects.filter(p => p.status === 'Completed').length, color: COLORS.purple },
          { label: "Delayed", value: projects.filter(p => p.status === 'Delayed').length, color: COLORS.danger },
        ].map(s => (
          <div key={s.label} style={{ background: COLORS.card, borderRadius: 14, padding: "16px 20px", border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 11, color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading && <div style={{ textAlign: "center", padding: 40, color: COLORS.muted }}>Loading projects...</div>}

      {/* Empty */}
      {!loading && projects.length === 0 && (
        <div style={{ background: COLORS.card, borderRadius: 16, padding: 60, textAlign: "center", border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>◈</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.primary, marginBottom: 8 }}>No projects yet</div>
          <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 20 }}>Create your first project to get started</div>
          {user.role !== 'employee' && (
            <button onClick={() => setShowForm(true)} style={{ background: COLORS.accent, color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              + Create Project
            </button>
          )}
        </div>
      )}

      {/* Projects Grid */}
      {!loading && projects.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {projects.map(p => (
            <div key={p._id} style={{ background: COLORS.card, borderRadius: 16, padding: "20px", border: `1px solid ${COLORS.border}`, transition: "box-shadow 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>

              {/* Project Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: p.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>◈</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ background: statusConfig[p.status]?.bg, color: statusConfig[p.status]?.text, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20 }}>{p.status}</span>
                  {user.role !== 'employee' && (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => handleEdit(p)} style={{ padding: "4px 8px", background: COLORS.accentLight, color: COLORS.accent, border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 500 }}>Edit</button>
                      <button onClick={() => handleDelete(p._id)} style={{ padding: "4px 8px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 500 }}>Del</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Name */}
              <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.primary, marginBottom: 4 }}>{p.name}</div>
              {p.description && <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 12, lineHeight: 1.5 }}>{p.description.slice(0, 80)}{p.description.length > 80 ? '...' : ''}</div>}

              {/* Stats Row */}
              <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: COLORS.muted }}>
                  <span style={{ fontWeight: 600, color: COLORS.primary }}>{p.taskCount || 0}</span> tasks
                </div>
                <div style={{ fontSize: 12, color: COLORS.muted }}>
                  <span style={{ fontWeight: 600, color: COLORS.primary }}>{p.members?.length || 0}</span> members
                </div>
                {p.end_date && (
                  <div style={{ fontSize: 12, color: COLORS.muted }}>
                    📅 {new Date(p.end_date).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Members Avatars */}
              {p.members && p.members.length > 0 && (
                <div style={{ display: "flex", marginBottom: 14 }}>
                  {p.members.slice(0, 5).map((m, i) => {
                    const initials = m?.name ? m.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
                    return (
                      <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: "#fff", marginLeft: i > 0 ? -8 : 0, border: "2px solid #fff", zIndex: 5 - i }}>{initials}</div>
                    );
                  })}
                  {p.members.length > 5 && (
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: COLORS.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: COLORS.muted, marginLeft: -8, border: "2px solid #fff" }}>+{p.members.length - 5}</div>
                  )}
                </div>
              )}

              {/* Progress */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.muted, marginBottom: 5 }}>
                  <span>Progress</span>
                  <span style={{ fontWeight: 600, color: COLORS.primary }}>{p.progress || 0}%</span>
                </div>
                <div style={{ height: 6, background: COLORS.border, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${p.progress || 0}%`, background: p.color || COLORS.accent, borderRadius: 4, transition: "width 0.5s ease" }} />
                </div>
                <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 4 }}>{p.completedCount || 0} of {p.taskCount || 0} tasks completed</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Form Modal */}
      <ProjectFormModal
        show={showForm}
        onClose={() => { setShowForm(false); setEditProject(null); }}
        onSave={fetchProjects}
        users={users}
        editProject={editProject}
      />
    </div>
  );
}