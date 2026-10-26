import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import OpportunityCard from '../components/OpportunityCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { CATEGORIES } from '../utils/constants';

const Opportunities = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ q: '', category: '', location: '', date: '' });
  const [opportunities, setOpportunities] = useState([]);
  const [myStatuses, setMyStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      client
        .get('/opportunities', { params: { ...params, status: 'Open' } })
        .then((res) => setOpportunities(res.data.opportunities))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [filters]);

  useEffect(() => {
    if (user && ['volunteer', 'user'].includes(user.role)) {
      client
        .get('/applications/mine')
        .then((res) => {
          const map = {};
          res.data.applications.forEach((a) => {
            if (a.opportunity?._id) map[a.opportunity._id] = a.status;
          });
          setMyStatuses(map);
        })
        .catch(() => {});
    }
  }, [user, message]);

  const apply = async (id) => {
    setMessage('');
    setError('');
    try {
      await client.post(`/applications/${id}/apply`);
      setMyStatuses((prev) => ({ ...prev, [id]: 'Applied' }));
      setMessage('Application submitted! The organization will review it — track it in your volunteer dashboard.');
    } catch (err) {
      setError(err.message);
    }
  };

  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Volunteer Opportunities</h1>
          <p className="page-sub">
            Structured activities run by organizations. Completed and verified activities count
            towards your <strong>service hours</strong>.
          </p>
        </div>
      </div>

      <div className="filter-bar card">
        <div className="field">
          <label htmlFor="oq">Search</label>
          <input id="oq" placeholder="e.g. teaching, plantation…" value={filters.q} onChange={set('q')} />
        </div>
        <div className="field">
          <label htmlFor="ocat">Category</label>
          <select id="ocat" value={filters.category} onChange={set('category')}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="oloc">Location</label>
          <input id="oloc" placeholder="e.g. Pune" value={filters.location} onChange={set('location')} />
        </div>
        <div className="field">
          <label htmlFor="odate">Date</label>
          <input id="odate" type="date" value={filters.date} onChange={set('date')} />
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <Loader />
      ) : opportunities.length === 0 ? (
        <EmptyState icon="❤️" title="No open opportunities found" hint="Try clearing the filters." />
      ) : (
        <div className="grid grid-2">
          {opportunities.map((o) => (
            <OpportunityCard
              key={o._id}
              opportunity={o}
              userRole={user?.role}
              myStatus={myStatuses[o._id]}
              onApply={() => apply(o._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Opportunities;
