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

const BACKEND_ORIGIN = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const resolveUrl = (raw = '') => {
  if (!raw) return '';
  if (/^(https?:|blob:|data:)/i.test(raw)) return raw;
  return `${BACKEND_ORIGIN}${raw.startsWith('/') ? '' : '/'}${raw}`;
};

// ─────────────────────────────────────────────────────────────
// Fetch a protected file using the JWT token, return a blob URL
// ─────────────────────────────────────────────────────────────
const fetchAuthenticatedBlob = async (url) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Failed to load file: ${res.status}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};

// ── PDF modal — fetches with auth token then shows as blob URL ──
const PdfModal = ({ pdf, onClose }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(true);
  const src = resolveUrl(pdf.url);

  useEffect(() => {
    let objectUrl = null;
    setLoading(true);
    setError('');
    fetchAuthenticatedBlob(src)
      .then((url) => { objectUrl = url; setBlobUrl(url); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    // Revoke blob URL on unmount to free memory
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [src]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = pdf.name;
    a.click();
  };

  const handleOpenTab = () => {
    if (blobUrl) window.open(blobUrl, '_blank');
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 900,
      background: 'rgba(10,30,61,.85)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 12, overflow: 'hidden',
        width: '100%', maxWidth: 900, maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 8px 48px rgba(10,30,61,.4)',
      }}>
        {/* Header */}
        <div style={{
          background: 'var(--navy)', padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <span style={{
            color: '#fff', fontSize: 14, fontWeight: 500,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
          }}>📄 {pdf.name}</span>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={handleOpenTab} disabled={!blobUrl} style={{
              background: 'rgba(255,255,255,.15)', color: '#fff', border: 'none', borderRadius: 7,
              padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: blobUrl ? 'pointer' : 'not-allowed', opacity: blobUrl ? 1 : .5,
            }}>↗ Open in tab</button>
            <button onClick={handleDownload} disabled={!blobUrl} style={{
              background: 'var(--gold)', color: 'var(--navy)', border: 'none', borderRadius: 7,
              padding: '6px 14px', fontSize: 13, fontWeight: 700, cursor: blobUrl ? 'pointer' : 'not-allowed', opacity: blobUrl ? 1 : .5,
            }}>↓ Download</button>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,.12)', border: 'none', borderRadius: 7,
              color: '#fff', width: 32, height: 32, cursor: 'pointer', fontSize: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>×</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, minHeight: 520, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
          {loading && (
            <div style={{ textAlign: 'center', color: '#718096' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
              <p style={{ fontSize: 14 }}>Loading PDF…</p>
            </div>
          )}
          {error && (
            <div style={{ textAlign: 'center', color: '#b71c1c', padding: 32 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
              <p style={{ fontSize: 14, marginBottom: 8 }}>Could not load the PDF.</p>
              <p style={{ fontSize: 12, color: '#718096' }}>{error}</p>
            </div>
          )}
          {blobUrl && (
            <iframe
              src={blobUrl}
              title={pdf.name}
              style={{ width: '100%', height: '100%', minHeight: 520, border: 'none' }}
            />
          )}
        </div>

        <div style={{
          background: '#fef9ec', borderTop: '1px solid rgba(201,164,65,.3)',
          padding: '10px 20px', fontSize: 12, color: '#7b5e00',
        }}>
          ⓘ If the PDF doesn't display inline, use <strong>Open in tab</strong> or <strong>Download</strong>.
        </div>
      </div>
    </div>
  );
};

// ── Image lightbox — also fetches with auth ──
const Lightbox = ({ src: rawSrc, onClose }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const src = resolveUrl(rawSrc);

  useEffect(() => {
    let objectUrl = null;
    fetchAuthenticatedBlob(src)
      .then((url) => { objectUrl = url; setBlobUrl(url); })
      .catch(() => setBlobUrl(src)); // fallback to direct URL for public images
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [src]);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(0,0,0,.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      {blobUrl
        ? <img src={blobUrl} alt="proof" onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: 8, objectFit: 'contain' }} />
        : <p style={{ color: '#fff' }}>Loading…</p>
      }
    </div>
  );
};

// ── Proof gallery ──
const ProofGallery = ({ proofs, onLightbox, onPdf }) => {
  if (!proofs || proofs.length === 0)
    return <span style={{ fontSize: 12, color: 'var(--text-light)' }}>No attachments</span>;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
      {proofs.map((p, i) => {
        const mime  = p.mimeType || p.mimetype || p.type || '';
        const url   = p.url || p.data || '';
        const name  = p.fileName || p.name || `file-${i + 1}`;
        const isImg = mime.startsWith('image/');
        const isPdf = mime === 'application/pdf';

        const tileStyle = {
          width: 80, height: 80, borderRadius: 8, background: 'var(--cream)',
          border: '1px solid var(--cream-mid)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 4, padding: 8,
          cursor: 'pointer', transition: 'border-color .2s', textDecoration: 'none',
        };
        const label = (
          <span style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'center', wordBreak: 'break-all', lineHeight: 1.2 }}>
            {name.length > 14 ? name.slice(0, 12) + '…' : name}
          </span>
        );
        const docIcon = (
          <svg fill="none" viewBox="0 0 24 24" stroke="var(--gold-dim)" strokeWidth={1.8} width={28} height={28}>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            {isPdf && <><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></>}
          </svg>
        );

        if (isImg) return (
          <div key={i} style={{ ...tileStyle, padding: 0, overflow: 'hidden' }}
            onClick={() => onLightbox(url)}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--cream-mid)'}>
            <AuthImage src={url} alt={name} />
          </div>
        );

        if (isPdf) return (
          <div key={i} style={tileStyle} title={`View: ${name}`}
            onClick={() => onPdf({ url, name })}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--cream-mid)'}>
            {docIcon}{label}
          </div>
        );

        // Generic doc — download with auth
        return (
          <div key={i} style={tileStyle} title={`Download: ${name}`}
            onClick={async () => {
              try {
                const blobUrl = await fetchAuthenticatedBlob(resolveUrl(url));
                const a = document.createElement('a');
                a.href = blobUrl; a.download = name; a.click();
                setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
              } catch { alert('Could not download file.'); }
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--cream-mid)'}>
            {docIcon}{label}
          </div>
        );
      })}
    </div>
  );
};

// Thumbnail that loads with auth token
const AuthImage = ({ src, alt }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  useEffect(() => {
    let objectUrl = null;
    fetchAuthenticatedBlob(resolveUrl(src))
      .then(u => { objectUrl = u; setBlobUrl(u); })
      .catch(() => setBlobUrl(resolveUrl(src)));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [src]);
  return blobUrl
    ? <img src={blobUrl} alt={alt} style={{ width: 80, height: 80, objectFit: 'cover', display: 'block' }} />
    : <div style={{ width: 80, height: 80, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🖼</div>;
};

// ════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [users,       setUsers]       = useState([]);
  const [stats,       setStats]       = useState({});
  const [loading,     setLoading]     = useState(true);
  const [panel,       setPanel]       = useState('all');
  const [filters,     setFilters]     = useState({ type: '', status: '', search: '' });
  const [detail,      setDetail]      = useState(null);
  const [lightbox,    setLightbox]    = useState(null);
  const [pdfModal,    setPdfModal]    = useState(null);

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
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filters]);

  const fetchUsers = useCallback(async () => {
    try { const res = await adminAPI.getUsers(); setUsers(res.data.users); } catch {}
  }, []);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminAPI.updateStatus(id, newStatus);
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
      if (detail?.id === id) setDetail(prev => ({ ...prev, status: newStatus }));
      fetchSubmissions();
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const applyFilter = (f) => {
    setPanel(f);
    if (f === 'users') { setFilters({ type: '', status: '', search: '' }); return; }
    const type   = (f === 'complaint' || f === 'compliment') ? f : '';
    const status = (f === 'new' || f === 'in review' || f === 'resolved') ? f : '';
    setFilters(prev => ({ ...prev, type, status }));
  };

  const panelTitles = {
    all: 'All Submissions', complaint: 'Complaints', compliment: 'Compliments',
    new: 'New Submissions', 'in review': 'In Review', resolved: 'Resolved', users: 'Registered Users',
  };

  const sidebarItems = [
    { key: 'all',        label: 'All Submissions', count: stats.total },
    { key: 'complaint',  label: 'Complaints',       count: stats.complaints },
    { key: 'compliment', label: 'Compliments',      count: stats.compliments },
    null,
    { key: 'new',        label: 'New',              count: stats.new_count },
    { key: 'in review',  label: 'In Review',        count: stats.review_count },
    { key: 'resolved',   label: 'Resolved',         count: stats.resolved_count },
    null,
    { key: 'users',      label: 'Registered Users', count: users.length },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--cream)' }}>

      {/* HEADER */}
      <header className="site-header">
        <div className="logo" onClick={() => navigate('/')}>
          <div className="logo-mark" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 40 40" fill="white" width={22} height={22}>
              <rect x="4"  y="32" width="32" height="3" rx="1.5" fill="currentColor"/>
              <rect x="4"  y="5"  width="32" height="3" rx="1.5" fill="currentColor"/>
              <rect x="7"  y="10" width="4"  height="20" rx="2" fill="currentColor"/>
              <rect x="14" y="10" width="4"  height="20" rx="2" fill="currentColor"/>
              <rect x="22" y="10" width="4"  height="20" rx="2" fill="currentColor"/>
              <rect x="29" y="10" width="4"  height="20" rx="2" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <span className="logo-text">Pillar<span>5</span> <span style={{ color: 'var(--gold)' }}>Admin</span></span>
            <span className="logo-sub">Above Average</span>
          </div>
        </div>
        <div className="header-nav">
          <button className="nav-btn" onClick={logout}>Sign Out</button>
        </div>
      </header>

      <div className="admin-layout" style={{ flex: 1, overflow: 'hidden' }}>

        {/* SIDEBAR */}
        <aside className="admin-sidebar">
          <div className="sidebar-logo"><span>Dashboard</span></div>
          <div className="sidebar-section">Submissions</div>
          {sidebarItems.map((item, i) => {
            if (!item) return (
              <div key={i} className="sidebar-section" style={{ marginTop: 12 }}>
                {i === 3 ? 'Status' : 'People'}
              </div>
            );
            return (
              <button key={item.key} className={`sidebar-item ${panel === item.key ? 'active' : ''}`}
                onClick={() => applyFilter(item.key)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <circle cx={12} cy={12} r={9}/>
                </svg>
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

          <div className="stats-grid">
            {[
              { label: 'Total',       value: stats.total        ?? 0, sub: 'submissions' },
              { label: 'Complaints',  value: stats.complaints   ?? 0, sub: 'require attention' },
              { label: 'Compliments', value: stats.compliments  ?? 0, sub: 'positive feedback' },
              { label: 'Pending',     value: (parseInt(stats.new_count || 0) + parseInt(stats.review_count || 0)), sub: 'new & in review', hl: true },
            ].map(s => (
              <div key={s.label} className={`stat-card ${s.hl ? 'highlight' : ''}`}>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          {panel === 'users' && (
            <div className="submissions-wrap">
              <div className="users-grid">
                {users.length === 0
                  ? <div className="empty-state"><h3>No registered users yet</h3></div>
                  : users.map(u => (
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

          {panel !== 'users' && (
            <>
              <div className="filters-bar">
                <label>Filter:</label>
                <select className="filter-select" value={filters.type}
                  onChange={e => setFilters({ ...filters, type: e.target.value })}>
                  <option value="">All Types</option>
                  <option value="complaint">Complaint</option>
                  <option value="compliment">Compliment</option>
                </select>
                <select className="filter-select" value={filters.status}
                  onChange={e => setFilters({ ...filters, status: e.target.value })}>
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="in review">In Review</option>
                  <option value="resolved">Resolved</option>
                </select>
                <input className="search-input" type="text" placeholder="Search by name, email or message…"
                  value={filters.search}
                  onChange={e => setFilters({ ...filters, search: e.target.value })} />
              </div>

              <div className="submissions-wrap">
                {loading
                  ? <div className="empty-state"><p>Loading…</p></div>
                  : submissions.length === 0
                    ? <div className="empty-state"><h3>No submissions found</h3><p>Try adjusting your filters.</p></div>
                    : submissions.map(s => (
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
                              {new Date(s.createdAt).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })}
                              <br />
                              {new Date(s.createdAt).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                        <div className="sub-card-message">{s.message}</div>
                        <div className="sub-card-footer">
                          <div className="sub-card-tags">
                            <TypeBadge type={s.type} />
                            {s.category && s.category !== 'Uncategorised' && (
                              <span className="badge" style={{ background: 'var(--cream)', color: 'var(--text-muted)', border: '1px solid var(--cream-mid)' }}>
                                {s.category}
                              </span>
                            )}
                            <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-light)' }}>
                              {s.referenceNum}
                            </span>
                          </div>
                          <div className="sub-card-actions">
                            <StatusBadge status={s.status} />
                            <select className="status-sel" value={s.status}
                              onChange={e => handleStatusChange(s.id, e.target.value)}>
                              <option value="new">New</option>
                              <option value="in review">In Review</option>
                              <option value="resolved">Resolved</option>
                            </select>
                            <button onClick={() => setDetail(s)}
                              style={{ background: 'none', border: '1px solid var(--cream-mid)', borderRadius: 6,
                                       padding: '4px 10px', fontSize: 12, cursor: 'pointer', color: 'var(--text-muted)' }}>
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
        <div className="modal-overlay open"
          onClick={e => { if (e.target === e.currentTarget) setDetail(null); }}>
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
                    {detail.submitter.email}
                    {detail.submitter.empNumber  ? ` · ${detail.submitter.empNumber}`  : ''}
                    {detail.submitter.department ? ` · ${detail.submitter.department}` : ''}
                  </div>
                </div>
              </div>

              {[
                ['Reference', <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{detail.referenceNum}</span>],
                ['Type',      <TypeBadge type={detail.type} />],
                ['Category',  detail.category || '—'],
                ['Submitted', new Date(detail.createdAt).toLocaleString('en-ZA')],
                ['Status',
                  <select className="status-sel" value={detail.status}
                    onChange={e => handleStatusChange(detail.id, e.target.value)}>
                    <option value="new">New</option>
                    <option value="in review">In Review</option>
                    <option value="resolved">Resolved</option>
                  </select>
                ],
              ].map(([label, val]) => (
                <div key={label} className="detail-row">
                  <label>{label}</label>
                  <div className="detail-val">{val}</div>
                </div>
              ))}

              <div className="detail-row" style={{ flexDirection: 'column', gap: 8 }}>
                <label>Message</label>
                <div className="message-box">{detail.message}</div>
              </div>

              <div className="detail-row" style={{ flexDirection: 'column', gap: 8 }}>
                <label>Proof Attachments ({detail.proofs?.length || 0})</label>
                <ProofGallery
                  proofs={detail.proofs}
                  onLightbox={src => setLightbox(src)}
                  onPdf={pdf => setPdfModal(pdf)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
      {pdfModal && <PdfModal pdf={pdfModal} onClose={() => setPdfModal(null)} />}
    </div>
  );
}