// frontend/src/views/AdminLoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form,  setForm]  = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy,  setBusy]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role !== 'admin') {
        setError('Access denied — admin accounts only.');
        return;
      }
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect credentials.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-top">
          {/* Pillar 5 SVG logo mark */}
          <div className="logo-mark" style={{ width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 40 40" fill="white" width={32} height={32}>
              <rect x="4" y="32" width="32" height="3" rx="1.5" fill="currentColor"/>
              <rect x="4" y="5"  width="32" height="3" rx="1.5" fill="currentColor"/>
              <rect x="7"  y="10" width="4" height="20" rx="2" fill="currentColor"/>
              <rect x="14" y="10" width="4" height="20" rx="2" fill="currentColor"/>
              <rect x="22" y="10" width="4" height="20" rx="2" fill="currentColor"/>
              <rect x="29" y="10" width="4" height="20" rx="2" fill="currentColor"/>
            </svg>
          </div>
          <h2>Admin Access</h2>
          <p>Authorised Pillar 5 Group staff only</p>
        </div>
        <div className="auth-body">
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@pillar5group.co.za"
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>
            <button className="submit-btn" type="submit" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign In as Admin'}
            </button>
          </form>
          <p className="form-switch"><Link to="/">← Back to home</Link></p>
        </div>
      </div>
    </div>
  );
}