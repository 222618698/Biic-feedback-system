// frontend/src/views/SubmitPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { feedbackAPI } from '../services/api';
import Logo from '../components/Logo';

const initials = (u) => `${u.firstName?.[0]||''}${u.lastName?.[0]||''}`.toUpperCase();

const StatusInfo = ({ status }) => {
  const map = {
    new:        { cls:'new',     dot:'new',     label:'New',       desc:'Your submission has been received and is awaiting review.' },
    'in review':{ cls:'review',  dot:'review',  label:'In Review', desc:'Management is currently reviewing your submission.' },
    resolved:   { cls:'resolved',dot:'resolved',label:'Resolved',  desc:'This submission has been reviewed and resolved.' },
  };
  const s = map[status] || map.new;
  return (
    <div className={`status-info ${s.cls}`} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:500, whiteSpace:'nowrap' }}>
      <span className={`status-dot ${s.dot}`} style={{ width:7, height:7, borderRadius:'50%', flexShrink:0, background: s.dot==='new'?'#4a77e8':s.dot==='review'?'#f6a623':'#38a169' }} />
      {s.label}
    </div>
  );
};

export default function SubmitPage() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const [tab,        setTab]        = useState('submit');
  const [form,       setForm]       = useState({ type:'complaint', categoryId:'', message:'' });
  const [categories, setCategories] = useState([]);
  const [proofFiles, setProofFiles] = useState([]); // { name, mimeType, previewUrl, file }
  const [error,      setError]      = useState('');
  const [busy,       setBusy]       = useState(false);
  const [submitted,  setSubmitted]  = useState(null);
  const [history,    setHistory]    = useState([]);
  const [histFilter, setHistFilter] = useState('');
  const [lightbox,   setLightbox]   = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    feedbackAPI.getCategories().then(r => setCategories(r.data.categories)).catch(() => {});
  }, []);

  const loadHistory = async () => {
    try {
      const res = await feedbackAPI.getMySubmissions(histFilter ? { type: histFilter } : {});
      setHistory(res.data.submissions);
    } catch { setHistory([]); }
  };

  useEffect(() => { if (tab === 'history') loadHistory(); }, [tab, histFilter]);

  const handleFiles = (files) => {
    const arr = Array.from(files);
    if (proofFiles.length + arr.length > 5) { setError('Maximum 5 files allowed.'); return; }
    const newFiles = arr.map(f => ({
      name:       f.name,
      mimeType:   f.type,
      previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
      file:       f,
    }));
    setProofFiles(prev => [...prev, ...newFiles]);
  };

  const removeProof = (i) => {
    setProofFiles(prev => {
      if (prev[i].previewUrl) URL.revokeObjectURL(prev[i].previewUrl);
      return prev.filter((_, idx) => idx !== i);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.message.trim().length < 10) { setError('Please write a more detailed message (min. 10 characters).'); return; }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('type',    form.type);
      fd.append('message', form.message.trim());
      if (form.categoryId) fd.append('categoryId', form.categoryId);
      proofFiles.forEach(pf => fd.append('proof_files', pf.file));
      const res = await feedbackAPI.submit(fd);
      setSubmitted({ referenceNum: res.data.referenceNum });
      setProofFiles([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const resetForm = () => {
    setForm({ type:'complaint', categoryId:'', message:'' });
    setProofFiles([]); setSubmitted(null); setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="page-wrap">
      {/* LIGHTBOX */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:600, cursor:'zoom-out' }}>
          <img src={lightbox} alt="proof" style={{ maxWidth:'90%', maxHeight:'90%', borderRadius:8, objectFit:'contain' }} />
        </div>
      )}

      <header className="site-header">
        <div className="logo" onClick={() => navigate('/')}>
          <div className="logo-mark"><Logo variant="mark" /></div>
          <div>
            <span className="logo-text">Pillar<span>5</span> Group</span>
            <span className="logo-sub">Above Average</span>
          </div>
        </div>
        <div className="header-nav">
          <div className="user-chip">
            <div className="user-avatar">{initials(user)}</div>
            <span>{user.firstName}</span>
          </div>
          <button className="nav-btn" onClick={logout}>Sign Out</button>
        </div>
      </header>

      <div className="main-content">
        {/* TAB BAR */}
        <div className="user-tabs" style={{ display:'flex', gap:0, borderBottom:'2px solid #ede5d4', marginBottom:28 }}>
          {[['submit','✏️ Submit Feedback'],['history','📋 My Submissions']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ background:'none', border:'none', fontFamily:'inherit', fontSize:14, fontWeight:500,
                color: tab===key ? '#0a1e3d' : '#4a5568', padding:'10px 20px', cursor:'pointer',
                borderBottom: tab===key ? '2px solid #c9a441' : '2px solid transparent', marginBottom:-2, transition:'all .2s' }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── SUBMIT TAB ── */}
        {tab === 'submit' && (
          <div className="form-card">
            <div className="form-header">
              <div className="form-header-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="#c9a441" strokeWidth={1.8}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </div>
              <div>
                <h2>Submit Feedback</h2>
                <p>Logged in as {user.firstName} {user.lastName}{user.empNumber ? ` · ${user.empNumber}` : ''}{user.department ? ` · ${user.department}` : ''}</p>
              </div>
            </div>

            {submitted ? (
              <div style={{ textAlign:'center', padding:'48px 32px' }}>
                <div className="success-icon" style={{ display:'flex' }}><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12"/></svg></div>
                <h3 style={{ fontFamily:"'DM Serif Display',serif", fontSize:26, fontWeight:400, marginBottom:8 }}>Feedback Received</h3>
                <p style={{ color:'#4a5568', maxWidth:340, margin:'0 auto 24px' }}>Your submission has been recorded and will be reviewed by Pillar 5 Group management.</p>
                <div className="ref-badge">Reference: <strong>{submitted.referenceNum}</strong></div>
                <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginTop:8 }}>
                  <button className="btn btn-primary" onClick={resetForm}>Submit Another</button>
                  <button className="btn" style={{ background:'#f5f0e4', color:'#0a1e3d', border:'1px solid #ede5d4' }} onClick={() => setTab('history')}>View My Submissions</button>
                </div>
              </div>
            ) : (
              <div className="form-body">
                <div className="info-note">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width:16, height:16, flexShrink:0, marginTop:1, color:'#9a7c2e' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <p>Your name and employee number are attached to this submission. Only authorised administrators can view submissions.</p>
                </div>

                {error && <div className="form-error" style={{ display:'block' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                  {/* Type toggle */}
                  <div className="type-toggle">
                    {['complaint','compliment'].map(t => (
                      <label key={t} className={`type-label${form.type===t?' active':''}`} style={form.type===t?{borderColor:'#c9a441',background:'#fdf9f0',boxShadow:'0 0 0 3px rgba(201,164,65,.15)'}:{}}>
                        <input type="radio" name="type" value={t} checked={form.type===t} onChange={e => setForm({...form, type:e.target.value})} style={{ display:'none' }} />
                        {t==='complaint'
                          ? <svg fill="none" viewBox="0 0 24 24" stroke="#b71c1c" strokeWidth={2} style={{ width:20, height:20 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                          : <svg fill="none" viewBox="0 0 24 24" stroke="#1565c0" strokeWidth={2} style={{ width:20, height:20 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        }
                        <span className="type-label-text" style={{ textTransform:'capitalize' }}>{t}</span>
                      </label>
                    ))}
                  </div>

                  <div className="field">
                    <label>Category <span className="opt">(optional)</span></label>
                    <select value={form.categoryId} onChange={e => setForm({...form, categoryId:e.target.value})}>
                      <option value="">Select a category…</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                    </select>
                  </div>

                  <div className="field">
                    <label>Message <span style={{ color:'#c9a441' }}>*</span></label>
                    <textarea value={form.message} onChange={e => setForm({...form, message:e.target.value})} placeholder="Describe your feedback in detail…" maxLength={1000} rows={6} required />
                    <div className="char-count">{form.message.length} / 1000</div>
                  </div>

                  {/* Proof upload */}
                  <div className="field">
                    <label>Supporting Proof <span className="opt">(photos or documents, max 5)</span></label>
                    <div onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor='#c9a441'; }}
                      onDragLeave={e => e.currentTarget.style.borderColor=''}
                      onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor=''; handleFiles(e.dataTransfer.files); }}
                      style={{ border:'2px dashed #e8dfc8', borderRadius:12, padding:24, textAlign:'center', background:'#f5f0e4', cursor:'pointer', position:'relative', transition:'border-color .2s' }}
                      onClick={() => fileInputRef.current?.click()}>
                      <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                        onChange={e => handleFiles(e.target.files)} style={{ display:'none' }} />
                      <svg fill="none" viewBox="0 0 24 24" stroke="#9a7c2e" strokeWidth={1.8} style={{ width:32, height:32, margin:'0 auto 8px', display:'block' }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <div style={{ fontSize:14, fontWeight:600, color:'#9a7c2e', marginBottom:2 }}>Click to upload or drag &amp; drop</div>
                      <div style={{ fontSize:12, color:'#718096' }}>Images, PDFs, Word &amp; Excel files · Max 5 files</div>
                    </div>
                    {/* Previews */}
                    {proofFiles.length > 0 && (
                      <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginTop:12 }}>
                        {proofFiles.map((pf, i) => (
                          <div key={i} style={{ position:'relative', borderRadius:8, overflow:'hidden', border:'1px solid #e8dfc8' }}>
                            {pf.previewUrl
                              ? <img src={pf.previewUrl} alt={pf.name} style={{ width:80, height:80, objectFit:'cover', display:'block' }} />
                              : <div style={{ width:80, height:80, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, padding:8, background:'#f5f0e4' }}>
                                  <svg fill="none" viewBox="0 0 24 24" stroke="#9a7c2e" strokeWidth={1.8} style={{ width:24, height:24 }}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                  <span style={{ fontSize:9, color:'#4a5568', textAlign:'center', wordBreak:'break-all', lineHeight:1.2 }}>{pf.name.length>14?pf.name.slice(0,11)+'...':pf.name}</span>
                                </div>
                            }
                            <button type="button" onClick={() => removeProof(i)}
                              style={{ position:'absolute', top:3, right:3, width:18, height:18, borderRadius:'50%', background:'rgba(183,28,28,.8)', border:'none', cursor:'pointer', color:'#fff', fontSize:11, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button className="submit-btn" type="submit" disabled={busy}>
                    {busy ? 'Submitting…' : 'Submit Feedback'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === 'history' && (
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
              <div>
                <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, fontWeight:400, color:'#0a1e3d' }}>My Submissions</h2>
                <p style={{ fontSize:13, color:'#4a5568', marginTop:2 }}>Track the status of your complaints and compliments</p>
              </div>
              <select value={histFilter} onChange={e => setHistFilter(e.target.value)}
                style={{ border:'1px solid #e8dfc8', borderRadius:8, padding:'7px 28px 7px 10px', fontFamily:'inherit', fontSize:13, background:'#fff', appearance:'none', cursor:'pointer' }}>
                <option value="">All Types</option>
                <option value="complaint">Complaints Only</option>
                <option value="compliment">Compliments Only</option>
              </select>
            </div>

            {history.length === 0
              ? <div style={{ textAlign:'center', padding:'48px 24px', background:'#fff', borderRadius:12, border:'1px solid #e8dfc8' }}>
                  <p style={{ color:'#718096' }}>No submissions yet. <button onClick={() => setTab('submit')} style={{ background:'none', border:'none', color:'#9a7c2e', fontWeight:500, cursor:'pointer', textDecoration:'underline' }}>Submit your first one →</button></p>
                </div>
              : <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {history.map(s => (
                    <div key={s.id} style={{ background:'#fff', borderRadius:14, border:'1px solid #e8dfc8', overflow:'hidden' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderBottom:'1px solid #e8dfc8', background:'#fdf9f0', flexWrap:'wrap', gap:8 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                          <span className={`badge badge-${s.type}`}><span className="badge-dot" />{s.type}</span>
                          {s.category && s.category !== 'Uncategorised' && <span style={{ fontSize:12, color:'#4a5568', background:'#e8dfc8', borderRadius:6, padding:'2px 8px' }}>{s.category}</span>}
                          <span style={{ fontSize:12, color:'#718096' }}>{new Date(s.createdAt).toLocaleDateString('en-ZA',{day:'2-digit',month:'short',year:'numeric'})}</span>
                        </div>
                        <StatusInfo status={s.status} />
                      </div>
                      <div style={{ padding:'14px 18px' }}>
                        <p style={{ fontSize:13, lineHeight:1.65, color:'#0a1e3d', whiteSpace:'pre-wrap', wordBreak:'break-word' }}>{s.message}</p>
                        {s.proofs?.length > 0 && (
                          <div style={{ display:'flex', gap:8, marginTop:10, flexWrap:'wrap', alignItems:'center' }}>
                            <span style={{ fontSize:11, color:'#718096', textTransform:'uppercase', letterSpacing:.5 }}>Proof ({s.proofs.length})</span>
                            {s.proofs.map(p => p.mimeType.startsWith('image/')
                              ? <img key={p.id} src={p.url} alt={p.fileName} onClick={() => setLightbox(p.url)} style={{ width:48, height:48, objectFit:'cover', borderRadius:6, border:'1px solid #e8dfc8', cursor:'zoom-in' }} />
                              : <a key={p.id} href={p.url} download={p.fileName} style={{ display:'inline-flex', alignItems:'center', gap:4, background:'#f5f0e4', border:'1px solid #e8dfc8', borderRadius:6, padding:'4px 10px', fontSize:11, color:'#9a7c2e', textDecoration:'none' }}>
                                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width:12, height:12 }}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                  {p.fileName.length>20 ? p.fileName.slice(0,17)+'...' : p.fileName}
                                </a>
                            )}
                          </div>
                        )}
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:10, flexWrap:'wrap', gap:8 }}>
                          <span style={{ fontFamily:'monospace', fontSize:11, color:'#718096' }}>Ref: {s.referenceNum}</span>
                          <span style={{ fontSize:12, color:'#718096', fontStyle:'italic' }}>
                            {s.status==='new'?'Awaiting review':s.status==='in review'?'Being reviewed by management':'Reviewed and resolved'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}
      </div>
    </div>
  );
}
