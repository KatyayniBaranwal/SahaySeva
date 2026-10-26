import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import client from '../api/client';
import Loader from '../components/Loader';
import { CATEGORIES, URGENCIES, rupees } from '../utils/constants';

const RequestHelp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('service');

  const [prefill, setPrefill] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    urgency: 'Medium',
    pricingType: 'Free',
    budget: '',
    preferredDate: '',
    preferredTime: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!serviceId) return;
    client
      .get(`/services/${serviceId}`)
      .then((res) => {
        const s = res.data.service;
        setPrefill(s);
        setForm((f) => ({
          ...f,
          title: s.title,
          category: s.category,
          location: s.location,
          pricingType: s.pricingType,
          budget: s.price || '',
          description: '',
        }));
      })
      .catch(() => {});
  }, [serviceId]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const payload = {
        ...form,
        budget: form.pricingType === 'Paid' ? Number(form.budget) : 0,
        preferredDate: form.preferredDate || undefined,
      };
      await client.post('/requests', payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  if (serviceId && !prefill) return <Loader />;

  return (
    <div className="container page page-narrow">
      <div className="page-head">
        <div>
          <h1>Request Help</h1>
          <p className="page-sub">
            Describe what you need. Volunteers and service providers in your area can accept it.
          </p>
        </div>
      </div>

      {prefill && (
        <div className="alert alert-info">
          Requesting the service <strong>“{prefill.title}”</strong> ({prefill.pricingType === 'Free' ? 'Free' : `${rupees(prefill.price)}`}) —
          just add your details below. <Link to={`/services/${prefill._id}`}>View service</Link>
        </div>
      )}

      <form onSubmit={submit} className="card form-card form-stack">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="field">
          <label htmlFor="title">Title *</label>
          <input id="title" required value={form.title} onChange={set('title')} placeholder="e.g. Need help getting groceries for an elderly person" />
        </div>

        <div className="field">
          <label htmlFor="desc">Describe your requirement *</label>
          <textarea id="desc" required rows={4} value={form.description} onChange={set('description')} placeholder="What exactly do you need, when, and any other details…" />
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="cat">Category *</label>
            <select id="cat" required value={form.category} onChange={set('category')}>
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="loc">Location *</label>
            <input id="loc" name="location" type="text" required value={form.location} onChange={set('location')} placeholder="Area, City" />
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="urg">Urgency *</label>
            <select id="urg" value={form.urgency} onChange={set('urgency')}>
              {URGENCIES.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="ptype">Free or Paid? *</label>
            <select id="ptype" value={form.pricingType} onChange={set('pricingType')}>
              <option value="Free">FREE — community help</option>
              <option value="Paid">PAID — I can pay for this</option>
            </select>
          </div>
        </div>

        {form.pricingType === 'Paid' && (
          <div className="field">
            <label htmlFor="budget">Your budget (₹) *</label>
            <input id="budget" type="number" min="1" required value={form.budget} onChange={set('budget')} placeholder="e.g. 500" />
          </div>
        )}

        <div className="form-grid">
          <div className="field">
            <label htmlFor="pdate">Preferred date</label>
            <input id="pdate" type="date" value={form.preferredDate} onChange={set('preferredDate')} />
          </div>
          <div className="field">
            <label htmlFor="ptime">Preferred time</label>
            <input id="ptime" name="preferredTime" type="time" value={form.preferredTime} onChange={set('preferredTime')} />
          </div>
        </div>

        <div className="form-note">
          ℹ️ Free community-help requests are fulfilled by volunteers and do not generate
          certificates. Structured volunteering with certificates happens via{' '}
          <Link to="/volunteer">verified programs</Link>.
        </div>

        <button className="btn btn-primary btn-lg" disabled={busy}>
          {busy ? 'Submitting…' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

export default RequestHelp;
