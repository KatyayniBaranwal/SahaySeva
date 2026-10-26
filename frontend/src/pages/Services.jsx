import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import ServiceCard from '../components/ServiceCard';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import { CATEGORIES } from '../utils/constants';

const Services = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ q: '', category: '', location: '', pricingType: '', sort: 'newest' });
  const [services, setServices] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadServices = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const res = await client.get('/services', { params });
      setServices(res.data.services);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(loadServices, 250);
    return () => clearTimeout(t);
  }, [filters]);

  useEffect(() => {
    if (user) {
      client
        .get('/services/saved')
        .then((res) => setSavedIds(new Set(res.data.services.map((s) => s._id))))
        .catch(() => {});
    }
  }, [user]);

  const toggleSave = async (id) => {
    if (!user) return;
    try {
      const res = await client.put(`/services/${id}/save`);
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (res.data.saved) next.add(id);
        else next.delete(id);
        return next;
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const set = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Local Services</h1>
          <p className="page-sub">Browse free community services and paid local services near you.</p>
        </div>
      </div>

      <div className="filter-bar card">
        <div className="field">
          <label htmlFor="q">Search</label>
          <input id="q" placeholder="Search services…" value={filters.q} onChange={set('q')} />
        </div>
        <div className="field">
          <label htmlFor="cat">Category</label>
          <select id="cat" value={filters.category} onChange={set('category')}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="loc">Location</label>
          <input id="loc" placeholder="e.g. Pune" value={filters.location} onChange={set('location')} />
        </div>
        <div className="field">
          <label htmlFor="price">Type</label>
          <select id="price" value={filters.pricingType} onChange={set('pricingType')}>
            <option value="">Free & Paid</option>
            <option value="Free">FREE only</option>
            <option value="Paid">PAID only</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="sort">Sort by</label>
          <select id="sort" value={filters.sort} onChange={set('sort')}>
            <option value="newest">Newest first</option>
            <option value="rating">Highest rated</option>
            <option value="priceLow">Price: low to high</option>
            <option value="priceHigh">Price: high to low</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <Loader />
      ) : services.length === 0 ? (
        <EmptyState icon="🔍" title="No services found" hint="Try changing the filters or search term." />
      ) : (
        <div className="grid grid-3">
          {services.map((s) => (
            <ServiceCard
              key={s._id}
              service={s}
              saved={savedIds.has(s._id)}
              onSaveToggle={user ? () => toggleSave(s._id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;
