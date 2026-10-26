import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../utils/constants';

const ROLE_OPTIONS = [
  { value: 'user', label: 'Community User', icon: '🙋', hint: 'I need help around my community' },
  { value: 'provider', label: 'Service Provider', icon: '🛠', hint: 'I offer local services' },
  { value: 'volunteer', label: 'Volunteer', icon: '❤️', hint: 'I want to volunteer for causes' },
  { value: 'ngo', label: 'NGO / Organization', icon: '🏛', hint: 'We run community programs' },
  { value: 'college', label: 'College / Institute', icon: '🎓', hint: 'We manage student service programs' },
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role');
  const [form, setForm] = useState({
    role: ROLE_OPTIONS.some((r) => r.value === initialRole) ? initialRole : 'user',
    name: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    organizationName: '',
    instituteName: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container auth-page">
      <div className="auth-card card auth-wide">
        <h2>Create your account</h2>
        <p className="auth-sub">Choose how you want to use SahaySeva — your dashboard adapts to it.</p>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="role-picker">
          {ROLE_OPTIONS.map((r) => (
            <button
              key={r.value}
              type="button"
              className={`role-option ${form.role === r.value ? 'active' : ''}`}
              onClick={() => setForm({ ...form, role: r.value })}
            >
              <span className="role-icon">{r.icon}</span>
              <strong>{r.label}</strong>
              <span className="role-hint">{r.hint}</span>
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="form-stack">
          {form.role === 'ngo' && (
            <div className="field">
              <label htmlFor="organizationName">Organization Name *</label>
              <input id="organizationName" required value={form.organizationName} onChange={set('organizationName')} placeholder="e.g. Seva Foundation" />
            </div>
          )}
          {form.role === 'college' && (
            <div className="field">
              <label htmlFor="instituteName">Institute Name *</label>
              <input id="instituteName" required value={form.instituteName} onChange={set('instituteName')} placeholder="e.g. ABC College of Engineering" />
            </div>
          )}
          <div className="form-grid">
            <div className="field">
              <label htmlFor="name">Full Name *</label>
              <input id="name" required value={form.name} onChange={set('name')} placeholder="Your name" />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" value={form.phone} onChange={set('phone')} placeholder="10-digit mobile" />
            </div>
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="email">Email *</label>
              <input id="email" type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" />
            </div>
            <div className="field">
              <label htmlFor="password">Password * (min 6 chars)</label>
              <input id="password" type="password" required minLength={6} value={form.password} onChange={set('password')} placeholder="••••••••" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="location">Location</label>
            <input id="location" value={form.location} onChange={set('location')} placeholder="Area, City" />
          </div>
          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Creating account…' : `Register as ${ROLE_LABELS[form.role]}`}
          </button>
        </form>
        <p className="auth-alt">
          Already registered? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
