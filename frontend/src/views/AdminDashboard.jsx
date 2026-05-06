// frontend/src/views/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { adminAPI } from '../services/api';

const initials = (name = '') =>
  name.split(' ').map((w) => w[0] || '').join('').toUpperCase().slice(0, 2);

const StatusBadge = ({ status }) => {
  const cls = { new: 'badge-new', 'in review': 'badge-review', resolved: 'badge-resolved' }[status] || 'badge-new';
  return <span className={`badge ${cls}`}><span className="badge-dot" />{status}</span>;
};

const TypeBadge = ({ type }) => (
  <span className={`badge ${type === 'complaint' ? 'badge-complaint' : 'badge-compliment'}`}>
    <span className="badge-dot" />{type}
  </span>
);

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [users,       setUsers]       = useState([]);
  const [stats,       setStats]       = useState({});
  const [loading,     setLoading]     = useState(true);
  const [panel,       setPanel]       = useState('all'); // all | complaint | compliment | new | in review | resolved | users
  const [filters,     setFilters]     = useState({ type:'', status:'', search:'' });
  const [detail,      setDetail]      = useState(null); // selected submission for modal

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.type)   params.type   = filters.type;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      const res = await adminAPI.getSubmissions(params);
      setSubmissions(res.data.submissions);
      setStats(res.data.stats || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await adminAPI.getUsers();
      setUsers(res.data.users);
    } catch {}
  }, []);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminAPI.updateStatus(id, newStatus);
      setSubmissions((prev) =>
        prev.map((s) => s.id === id ? { ...s, status: newStatus } : s)
      );
      if (detail?.id === id) setDetail({ ...detail, status: newStatus });
      // Update stats
      fetchSubmissions();
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const applyFilter = (f, btn) => {
    setPanel(f);
    if (f === 'users') { setFilters({ type:'', status:'', search:'' }); return; }
    const type   = (f === 'complaint' || f === 'compliment') ? f : '';
    const status = (f === 'new' || f === 'in review' || f === 'resolved') ? f : '';
    setFilters((prev) => ({ ...prev, type, status }));
  };

  const panelTitles = {
    all:'All Submissions', complaint:'Complaints', compliment:'Compliments',
    new:'New Submissions', 'in review':'In Review', resolved:'Resolved', users:'Registered Users',
  };

  const sidebarItems = [
    { key:'all',        label:'All Submissions', count: stats.total },
    { key:'complaint',  label:'Complaints',      count: stats.complaints },
    { key:'compliment', label:'Compliments',     count: stats.compliments },
    null, // divider
    { key:'new',        label:'New',             count: stats.new_count },
    { key:'in review',  label:'In Review',       count: stats.review_count },
    { key:'resolved',   label:'Resolved',        count: stats.resolved_count },
    null,
    { key:'users',      label:'Registered Users',count: users.length },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'var(--cream)' }}>
      {/* HEADER */}
      <header className="site-header">
        <div className="logo" onClick={() => navigate('/')}>
          <div className="logo-mark">B</div>
          <span className="logo-text">BIIC <span>Admin</span></span>
        </div>
        <div className="header-nav">
          <button className="nav-btn" onClick={logout}>Sign Out</button>
        </div>
      </header>

      <div className="admin-layout" style={{ flex:1, overflow:'hidden' }}>
        {/* SIDEBAR */}
        <aside className="admin-sidebar">
          <div className="sidebar-logo"><span>Dashboard</span></div>
          <div className="sidebar-section">Submissions</div>
          {sidebarItems.map((item, i) => {
            if (!item) return <div key={i} className="sidebar-section" style={{ marginTop:12 }}>Status</div>;
            if (item.key === 'users') return (
              <React.Fragment key={item.key}>
                <div className="sidebar-section">People</div>
                <button className={`sidebar-item ${panel === item.key ? 'active' : ''}`}
                  onClick={() => applyFilter(item.key)}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx={9} cy={7} r={4}/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                  {item.label} <span className="badge">{item.count ?? 0}</span>
                </button>
              </React.Fragment>
            );
            return (
              <button key={item.key} className={`sidebar-item ${panel === item.key ? 'active' : ''}`}
                onClick={() => applyFilter(item.key)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx={12} cy={12} r={9}/></svg>
                {item.label} <span className="badge">{item.count ?? 0}</span>
              </button>
            );
          })}
        </aside>

        {/* MAIN */}
        <main className="admin-main">
          <div className="admin-topbar">
            <div>
              <h1>{panelTitles[panel] || 'Submissions'}</h1>
              <p>
                {panel === 'users'
                  ? `${users.length} registered employee${users.length !== 1 ? 's' : ''}`
                  : `${submissions.length} submission${submissions.length !== 1 ? 's' : ''} shown`}
              </p>
            </div>
            <button className="nav-btn" onClick={fetchSubmissions}>↻ Refresh</button>
          </div>

          {/* STATS */}
          <div className="stats-grid">
            {[
              { label:'Total',      value: stats.total      ?? 0, sub:'submissions' },
              { label:'Complaints', value: stats.complaints ?? 0, sub:'require attention' },
              { label:'Compliments',value: stats.compliments ?? 0, sub:'positive feedback' },
              { label:'Pending',    value: (parseInt(stats.new_count||0) + parseInt(stats.review_count||0)), sub:'new & in review', hl:true },
            ].map((s) => (
              <div key={s.label} className={`stat-card ${s.hl ? 'highlight' : ''}`}>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* ── USERS PANEL ── */}
          {panel === 'users' && (
            <div className="submissions-wrap">
              <div className="users-grid">
                {users.length === 0
                  ? <div className="empty-state"><h3>No registered users yet</h3></div>
                  : users.map((u) => (
                    <div key={u.id} className="user-card">
                      <div className="uc-avatar">{initials(u.fullName)}</div>
                      <div>
                        <div className="uc-name">{u.fullName}</div>
                        <div className="uc-meta">{u.email}</div>
                        <div className="uc-meta">{u.department || 'No department'}</div>
                      </div>
                      <div className="uc-count">
                        <div className="num">{u.submissionCount}</div>
                        <div className="lbl">item{u.submissionCount !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* ── SUBMISSIONS PANEL ── */}
          {panel !== 'users' && (
            <>
              {/* Filters */}
              <div className="filters-bar">
                <label>Filter:</label>
                <select className="filter-select" value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
                  <option value="">All Types</option>
                  <option value="complaint">Complaint</option>
                  <option value="compliment">Compliment</option>
                </select>
                <select className="filter-select" value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="in review">In Review</option>
                  <option value="resolved">Resolved</option>
                </select>
                <input className="search-input" type="text" placeholder="Search by name, email or message…"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
              </div>

              {/* Card list */}
              <div className="submissions-wrap">
                {loading
                  ? <div className="empty-state"><p>Loading…</p></div>
                  : submissions.length === 0
                    ? <div className="empty-state">
                        <h3>No submissions found</h3>
                        <p>Try adjusting your filters.</p>
                      </div>
                    : submissions.map((s) => (
                      <div key={s.id} className="sub-card">
                        <div className="sub-card-top">
                          <div className="sub-card-left">
                            <div className="sub-avatar">{initials(s.submitter.fullName)}</div>
                            <div>
                              <div className="sub-card-name">{s.submitter.fullName}</div>
                              <div className="sub-card-email">
                                {s.submitter.email}{s.submitter.department ? ` · ${s.submitter.department}` : ''}
                              </div>
                            </div>
                          </div>
                          <div className="sub-card-right">
                            <div className="sub-card-date">
                              {new Date(s.createdAt).toLocaleDateString('en-ZA',{day:'2-digit',month:'short',year:'numeric'})}
                              <br />
                              {new Date(s.createdAt).toLocaleTimeString('en-ZA',{hour:'2-digit',minute:'2-digit'})}
                            </div>
                          </div>
                        </div>

                        <div className="sub-card-message">{s.message}</div>

                        <div className="sub-card-footer">
                          <div className="sub-card-tags">
                            <TypeBadge type={s.type} />
                            {s.category && s.category !== 'Uncategorised' && (
                              <span className="badge" style={{ background:'var(--cream)',color:'var(--text-muted)',border:'1px solid var(--cream-mid)' }}>
                                {s.category}
                              </span>
                            )}
                            <span style={{ fontFamily:'monospace', fontSize:11, color:'var(--text-light)' }}>
                              {s.referenceNum}
                            </span>
                          </div>
                          <div className="sub-card-actions">
                            <StatusBadge status={s.status} />
                            <select className="status-sel" value={s.status}
                              onChange={(e) => handleStatusChange(s.id, e.target.value)}>
                              <option value="new">New</option>
                              <option value="in review">In Review</option>
                              <option value="resolved">Resolved</option>
                            </select>
                            <button onClick={() => setDetail(s)}
                              style={{ background:'none', border:'1px solid var(--cream-mid)', borderRadius:6,
                                       padding:'4px 10px', fontSize:12, cursor:'pointer', color:'var(--text-muted)' }}>
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                }
              </div>
            </>
          )}
        </main>
      </div>

      {/* DETAIL MODAL */}
      {detail && (
        <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setDetail(null); }}>
          <div className="modal-card">
            <div className="modal-header">
              <h3>Submission Detail</h3>
              <button className="modal-close" onClick={() => setDetail(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="sp-block">
                <div className="sp-avatar">{initials(detail.submitter.fullName)}</div>
                <div>
                  <div className="sp-name">{detail.submitter.fullName}</div>
                  <div className="sp-sub">
                    {detail.submitter.email}{detail.submitter.department ? ` · ${detail.submitter.department}` : ''}
                  </div>
                </div>
              </div>
              {[
                ['Reference', <span style={{ fontFamily:'monospace', fontSize:13 }}>{detail.referenceNum}</span>],
                ['Type',      <TypeBadge type={detail.type} />],
                ['Category',  detail.category],
                ['Submitted', new Date(detail.createdAt).toLocaleString('en-ZA')],
                ['Status',    <select className="status-sel" value={detail.status}
                                onChange={(e) => handleStatusChange(detail.id, e.target.value)}>
                                <option value="new">New</option>
                                <option value="in review">In Review</option>
                                <option value="resolved">Resolved</option>
                              </select>],
              ].map(([label, val]) => (
                <div key={label} className="detail-row">
                  <label>{label}</label>
                  <div className="detail-val">{val}</div>
                </div>
              ))}
              <div className="detail-row" style={{ flexDirection:'column', gap:8 }}>
                <label>Message</label>
                <div className="message-box">{detail.message}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
