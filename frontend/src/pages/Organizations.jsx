import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import OrganizationCard from '../components/OrganizationCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

const Organizations = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('sahayseva');
  const [filters, setFilters] = useState({ q: '', cause: '' });
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      client
        .get('/organizations', { params: { ...params, type: tab } })
        .then((res) => setOrganizations(res.data.organizations))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [tab, filters]);

  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Organizations</h1>
          <p className="page-sub">
            SahaySeva partner organizations accept volunteers on-platform. External listings are
            public resources only — they are <strong>not</strong> SahaySeva partners.
          </p>
        </div>
        {(!user || user.role === 'ngo') && (
          <Link to={user ? '/dashboard' : '/register?role=ngo'} className="btn btn-primary">
            🏛 Register Your Organization
          </Link>
        )}
      </div>

      <div className="tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'sahayseva'}
          className={`tab ${tab === 'sahayseva' ? 'active' : ''}`}
          onClick={() => setTab('sahayseva')}
        >
          A. SahaySeva Organizations
        </button>
        <button
          role="tab"
          aria-selected={tab === 'external'}
          className={`tab ${tab === 'external' ? 'active' : ''}`}
          onClick={() => setTab('external')}
        >
          B. External Organizations
        </button>
      </div>

      <div className="filter-bar card">
        <div className="field">
          <label htmlFor="oq2">Search</label>
          <input id="oq2" placeholder="Search organizations…" value={filters.q} onChange={set('q')} />
        </div>
        <div className="field">
          <label htmlFor="cause">Cause</label>
          <input id="cause" placeholder="e.g. Education" value={filters.cause} onChange={set('cause')} />
        </div>
      </div>

      {tab === 'external' && (
        <div className="alert alert-info">
          ℹ️ External organization cards link to their official websites. SahaySeva never claims
          these organizations as partners. Fictional sample records are labelled{' '}
          <strong>“Demo Organization”</strong>.
        </div>
      )}

      {loading ? (
        <Loader />
      ) : organizations.length === 0 ? (
        <EmptyState icon="🏛" title="No organizations found" hint="Try a different search." />
      ) : (
        <div className="grid grid-2">
          {organizations.map((o) => (
            <OrganizationCard key={o._id} organization={o} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Organizations;
