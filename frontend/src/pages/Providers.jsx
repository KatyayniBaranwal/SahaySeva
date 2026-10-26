import { useEffect, useState } from 'react';
import client from '../api/client';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import StarRating from '../components/StarRating';
import { CATEGORIES } from '../utils/constants';

const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [filters, setFilters] = useState({ q: '', category: '', pricingType: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      client
        .get('/providers', { params })
        .then((res) => setProviders(res.data.providers))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [filters]);

  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Service Providers</h1>
          <p className="page-sub">Local professionals and volunteers offering their services.</p>
        </div>
      </div>

      <div className="filter-bar card">
        <div className="field">
          <label htmlFor="pq">Search</label>
          <input id="pq" placeholder="e.g. repair, tutor…" value={filters.q} onChange={set('q')} />
        </div>
        <div className="field">
          <label htmlFor="pcat">Category</label>
          <select id="pcat" value={filters.category} onChange={set('category')}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="ptype">Type</label>
          <select id="ptype" value={filters.pricingType} onChange={set('pricingType')}>
            <option value="">Free & Paid</option>
            <option value="Free">FREE providers</option>
            <option value="Paid">PAID providers</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : providers.length === 0 ? (
        <EmptyState icon="🛠" title="No providers found" hint="Try different filters." />
      ) : (
        <div className="grid grid-3">
          {providers.map((p) => (
            <article className="card provider-card" key={p._id}>
              <div className="provider-head">
                <span className="avatar large">{(p.user?.name || 'P').charAt(0)}</span>
                <div>
                  <h3>{p.user?.name}</h3>
                  <span className="badge badge-cat">{p.category}</span>
                </div>
              </div>
              <p className="card-desc">{p.description || 'No description provided.'}</p>
              <div className="card-meta">
                <span>📍 {p.location || '—'}</span>
                {p.availability && <span>🕘 {p.availability}</span>}
                <span>✅ {p.completedServices} completed</span>
                <span>
                  🛡{' '}
                  {p.verificationStatus === 'Verified' ? (
                    <span className="badge badge-verified">VERIFIED</span>
                  ) : (
                    p.verificationStatus
                  )}
                </span>
              </div>
              <div className={`price-tag ${p.pricingType === 'Free' ? 'free' : ''}`}>
                {p.pricingType === 'Free' ? 'FREE SERVICE' : `from ₹${p.price}`}
              </div>
              <div className="card-footer">
                <StarRating value={p.rating} count={p.numReviews} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Providers;
