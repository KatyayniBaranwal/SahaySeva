import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import RequestCard from '../components/RequestCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { CATEGORIES, URGENCIES } from '../utils/constants';

const BrowseRequests = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ q: '', category: '', location: '', urgency: '', pricingType: '' });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const res = await client.get('/requests', { params: { ...params, scope: 'open' } });
      setRequests(res.data.requests);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [filters]);

  const accept = async (id) => {
    setMessage('');
    try {
      await client.put(`/requests/${id}/status`, { status: 'Accepted' });
      setMessage('Request accepted! Track it in your dashboard under "My Accepted Help Requests".');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });
  const canAccept = user && ['user', 'provider', 'volunteer'].includes(user.role);

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Community Help Requests</h1>
          <p className="page-sub">
            Open requests from community members. Volunteers and service providers can accept them.
          </p>
        </div>
        {user?.role === 'user' && (
          <Link to="/request-help" className="btn btn-primary">+ New Help Request</Link>
        )}
      </div>

      <div className="filter-bar card">
        <div className="field">
          <label htmlFor="rq">Search</label>
          <input id="rq" placeholder="e.g. groceries, tutor…" value={filters.q} onChange={set('q')} />
        </div>
        <div className="field">
          <label htmlFor="rcat">Category</label>
          <select id="rcat" value={filters.category} onChange={set('category')}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="rloc">Location</label>
          <input id="rloc" placeholder="e.g. Pune" value={filters.location} onChange={set('location')} />
        </div>
        <div className="field">
          <label htmlFor="rurg">Urgency</label>
          <select id="rurg" value={filters.urgency} onChange={set('urgency')}>
            <option value="">Any urgency</option>
            {URGENCIES.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="rprice">Type</label>
          <select id="rprice" value={filters.pricingType} onChange={set('pricingType')}>
            <option value="">Free & Paid</option>
            <option value="Free">FREE only</option>
            <option value="Paid">PAID only</option>
          </select>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}
      {!user && (
        <div className="alert alert-info">
          <Link to="/login">Login</Link> as a volunteer or service provider to accept requests.
        </div>
      )}

      {loading ? (
        <Loader />
      ) : requests.length === 0 ? (
        <EmptyState icon="🙌" title="No open requests right now" hint="All community requests have been taken care of!" />
      ) : (
        <div className="grid grid-2">
          {requests.map((r) => (
            <RequestCard
              key={r._id}
              request={r}
              actions={
                canAccept ? (
                  <button className="btn btn-primary btn-sm" onClick={() => accept(r._id)}>
                    🤝 Accept Request
                  </button>
                ) : null
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseRequests;
