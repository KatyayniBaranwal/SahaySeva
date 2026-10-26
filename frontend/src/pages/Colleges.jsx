import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';

const Colleges = () => {
  const [institutes, setInstitutes] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      client
        .get('/institutes', { params: q ? { q } : {} })
        .then((res) => setInstitutes(res.data.institutes))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Colleges &amp; Institutes</h1>
          <p className="page-sub">
            Registered institutes run structured community-service programs. Students earn verified
            service hours and certificates.
          </p>
        </div>
      </div>

      <div className="filter-bar card">
        <div className="field">
          <label htmlFor="cq">Search institutes</label>
          <input id="cq" placeholder="e.g. Nagarjuna" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : institutes.length === 0 ? (
        <EmptyState icon="🎓" title="No institutes found" />
      ) : (
        <div className="grid grid-3">
          {institutes.map((i) => (
            <article className="card" key={i._id}>
              <div className="card-badges">
                <span className="badge badge-college">INSTITUTE</span>
                <Badge type={i.verificationStatus === 'Verified' ? 'verified' : 'pending'}>
                  {i.verificationStatus === 'Verified' ? '✓ VERIFIED' : i.verificationStatus}
                </Badge>
              </div>
              <h3 className="card-title">
                <Link to={`/colleges/${i._id}`}>{i.name}</Link>
              </h3>
              <p className="card-desc">{i.description}</p>
              <div className="card-meta">
                <span>📍 {i.location || '—'}</span>
                <span>👥 {i.studentCount} affiliated students</span>
                <span>📚 {i.openPrograms} open programs</span>
              </div>
              <div className="card-footer card-footer-actions">
                <Link to={`/colleges/${i._id}`} className="btn btn-primary btn-sm">
                  View Programs
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Colleges;
