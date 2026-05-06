// frontend/src/views/SubmitPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { feedbackAPI } from '../services/api';

export default function SubmitPage() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const [form,       setForm]       = useState({ type: 'complaint', categoryId: '', message: '' });
  const [categories, setCategories] = useState([]);
  const [error,      setError]      = useState('');
  const [busy,       setBusy]       = useState(false);
  const [submitted,  setSubmitted]  = useState(null); // { referenceNum }

  useEffect(() => {
    feedbackAPI.getCategories()
      .then((r) => setCategories(r.data.categories))
      .catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.message.trim().length < 10) {
      setError('Please write a more detailed message (min. 10 characters).');
      return;
    }
    setBusy(true);
    try {
      const res = await feedbackAPI.submit({
        type:       form.type,
        categoryId: form.categoryId || null,
        message:    form.message.trim(),
      });
      setSubmitted({ referenceNum: res.data.referenceNum });
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const initials = (u) =>
    `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase();

  if (submitted) {
    return (
      <div className="page-wrap">
        <header className="site-header">
          <div className="logo" onClick={() => navigate('/')}>
            <div className="logo-mark">B</div>
            <span className="logo-text">BIIC <span>Portal</span></span>
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
          <div className="form-card">
            <div className="success-state" style={{ display: 'block' }}>
              <div className="success-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h3>Feedback Received</h3>
              <p>Your submission has been recorded and will be reviewed by the BIIC management team.</p>
              <div className="ref-badge">Reference: <strong>{submitted.referenceNum}</strong></div>
              <button className="btn btn-primary" onClick={() => { setSubmitted(null); setForm({ type:'complaint', categoryId:'', message:'' }); }}>
                Submit Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <header className="site-header">
        <div className="logo" onClick={() => navigate('/')}>
          <div className="logo-mark">B</div>
          <span className="logo-text">BIIC <span>Portal</span></span>
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
        <div className="form-card">
          <div className="form-header">
            <div className="form-header-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="#c9a84c" strokeWidth={1.8}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </div>
            <div>
              <h2>Submit Feedback</h2>
              <p>Logged in as {user.firstName} {user.lastName}{user.department ? ` · ${user.department}` : ''}</p>
            </div>
          </div>

          <div className="form-body">
            <div className="info-note">
              Your name is attached to this submission so management can follow up. Only authorised administrators can view submissions.
            </div>

            {error && <div className="form-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              {/* Type toggle */}
              <div className="type-toggle">
                {['complaint', 'compliment'].map((t) => (
                  <label key={t} className={`type-label ${form.type === t ? 'active' : ''}`}>
                    <input type="radio" name="type" value={t}
                      checked={form.type === t} onChange={handleChange} style={{ display:'none' }} />
                    {t === 'complaint'
                      ? <svg fill="none" viewBox="0 0 24 24" stroke="#e53e3e" strokeWidth={2}><circle cx={12} cy={12} r={10}/><line x1={12} y1={8} x2={12} y2={12}/><line x1={12} y1={16} x2={12.01} y2={16}/></svg>
                      : <svg fill="none" viewBox="0 0 24 24" stroke="#38a169" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    }
                    <span className="type-label-text" style={{ textTransform:'capitalize' }}>{t}</span>
                  </label>
                ))}
              </div>

              <div className="field">
                <label>Category <span className="opt">(optional)</span></label>
                <select name="categoryId" value={form.categoryId} onChange={handleChange}>
                  <option value="">Select a category…</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                </select>
              </div>

              <div className="field">
                <label>Message <span style={{ color:'#7a5f25' }}>*</span></label>
                <textarea name="message" value={form.message} onChange={handleChange}
                  placeholder="Describe your feedback in detail…"
                  maxLength={1000} rows={6} required />
                <div className="char-count">{form.message.length} / 1000</div>
              </div>

              <button className="submit-btn" type="submit" disabled={busy}>
                {busy ? 'Submitting…' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
