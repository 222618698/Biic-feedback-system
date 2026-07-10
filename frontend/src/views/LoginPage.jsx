// frontend/src/views/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import Logo from '../components/Logo';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form,  setForm]  = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy,  setBusy]  = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/submit');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-top">
          <div className="logo-mark"><Logo variant="mark" /></div>
          <h2>Employee Sign In</h2>
          <p>Access the Pillar 5 Group Feedback Portal</p>
        </div>
        <div className="auth-body">
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email Address</label>
              <input name="email" type="email" value={form.email}
                onChange={handleChange} placeholder="you@pillar5group.co.za" required />
            </div>
            <div className="field">
              <label>Password</label>
              <input name="password" type="password" value={form.password}
                onChange={handleChange} placeholder="••••••••" required />
            </div>
            <button className="submit-btn" type="submit" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <p className="form-switch">
            No account? <Link to="/register">Register here</Link>
          </p>
          <p className="form-switch">
            <Link to="/">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
