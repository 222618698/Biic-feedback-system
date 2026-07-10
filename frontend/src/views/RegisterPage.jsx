// frontend/src/views/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { feedbackAPI } from '../services/api';
import Logo from '../components/Logo';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form,  setForm]  = useState({ firstName:'', lastName:'', email:'', password:'', empNumber:'', departmentId:'' });
  const [depts, setDepts] = useState([]);
  const [error, setError] = useState('');
  const [busy,  setBusy]  = useState(false);

  useEffect(() => {
    feedbackAPI.getDepartments().then(r => setDepts(r.data.departments)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.toLowerCase().endsWith('@pillar5group.co.za')) {
      setError('You must use a @pillar5group.co.za email address to register.');
      return;
    }
    if (!form.empNumber.trim()) { setError('Employee or contract number is required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setBusy(true);
    try {
      await register({
        firstName:    form.firstName.trim(),
        lastName:     form.lastName.trim(),
        email:        form.email.trim(),
        password:     form.password,
        empNumber:    form.empNumber.trim(),
        departmentId: form.departmentId || null,
      });
      navigate('/submit');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-top">
          <div className="logo-mark"><Logo variant="mark" /></div>
          <h2>Create Account</h2>
          <p>Register to submit feedback to Pillar 5 Group</p>
        </div>
        <div className="auth-body">
          {error && <div className="form-error" style={{ display:'block' }}>{error}</div>}
          <div className="info-note" style={{ marginBottom:16 }}>
            You must use your official <strong>@pillar5group.co.za</strong> email address.
          </div>
          <form onSubmit={handleSubmit}>
            <div className="field-row">
              <div className="field">
                <label>First Name</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Sarah" required />
              </div>
              <div className="field">
                <label>Last Name</label>
                <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Mthembu" required />
              </div>
            </div>
            <div className="field">
              <label>Pillar 5 Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="s.mthembu@pillar5group.co.za" required />
            </div>
            <div className="field">
              <label>Employee / Contract Number</label>
              <input name="empNumber" value={form.empNumber} onChange={handleChange} placeholder="e.g. EMP-00142 or CON-2024-017" required />
            </div>
            <div className="field">
              <label>Department <span className="opt">(optional)</span></label>
              <select name="departmentId" value={form.departmentId} onChange={handleChange}>
                <option value="">Select department…</option>
                {depts.map(d => <option key={d.id} value={d.id}>{d.dept_name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required />
            </div>
            <button className="submit-btn" type="submit" disabled={busy}>
              {busy ? 'Creating account…' : 'Create Account & Continue'}
            </button>
          </form>
          <p className="form-switch">Already registered? <Link to="/login">Sign in</Link></p>
          <p className="form-switch"><Link to="/">← Back to home</Link></p>
        </div>
      </div>
    </div>
  );
}
