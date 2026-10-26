import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  ['Community User', 'ravi@sahayseva.com', 'Password@123'],
  ['Service Provider', 'anita@sahayseva.com', 'Password@123'],
  ['Volunteer', 'arjun@sahayseva.com', 'Password@123'],
  ['NGO', 'seva@sahayseva.com', 'Password@123'],
  ['College', 'college@sahayseva.com', 'Password@123'],
  ['Student', 'sneha@sahayseva.com', 'Student@123'],
  ['Admin', 'admin@sahayseva.com', 'Admin@123'],
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from || '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container auth-page">
      <div className="auth-card card">
        <h2>Welcome back 👋</h2>
        <p className="auth-sub">Login to reach your role-based dashboard.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit} className="form-stack">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Logging in…' : 'Login'}
          </button>
        </form>
        <p className="auth-alt">
          New to SahaySeva? <Link to="/register">Create an account</Link>
        </p>
        <div className="demo-creds">
          <h5>Demo accounts (one-click fill)</h5>
          <div className="demo-grid">
            {DEMO_ACCOUNTS.map(([role, email, password]) => (
              <button
                key={email}
                type="button"
                className="chip-btn"
                onClick={() => setForm({ email, password })}
              >
                <strong>{role}</strong>
                <span>{email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
