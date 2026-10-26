import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import Badge from '../components/Badge';
import OpportunityCard from '../components/OpportunityCard';

const OrganizationDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [myStatuses, setMyStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = () => {
    client
      .get(`/organizations/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

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
  }, [user]);

  const apply = async (oppId) => {
    try {
      await client.post(`/applications/${oppId}/apply`);
      setMyStatuses((prev) => ({ ...prev, [oppId]: 'Applied' }));
      setMessage('Application submitted! Track it in your volunteer dashboard.');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loader />;
  if (error || !data)
    return (
      <div className="container page">
        <div className="alert alert-error">{error || 'Organization not found.'}</div>
        <Link to="/organizations" className="btn btn-outline">← Back to Organizations</Link>
      </div>
    );

  const { organization: org, opportunities } = data;
  const isSahaySeva = org.organizationType === 'SahaySeva Organization';

  return (
    <div className="container page">
      <Link to="/organizations" className="back-link">← Back to Organizations</Link>

      <div className="card detail-main">
        <div className="card-badges">
          {isSahaySeva ? (
            <Badge type="sahayseva">SAHAYSEVA ORGANIZATION</Badge>
          ) : org.organizationType === 'Demo Organization' ? (
            <Badge type="demo">DEMO ORGANIZATION</Badge>
          ) : (
            <Badge type="external">EXTERNAL ORGANIZATION</Badge>
          )}
          <Badge type={org.verificationStatus === 'Verified' ? 'verified' : 'pending'}>
            {org.verificationStatus === 'Verified' ? '✓ VERIFIED ORGANIZATION' : org.verificationStatus}
          </Badge>
        </div>
        <h1>{org.name}</h1>
        <p className="detail-desc">{org.description}</p>
        <div className="detail-facts">
          <div><span>🎯 Causes</span><strong>{org.causes?.join(', ') || '—'}</strong></div>
          <div><span>📍 Location</span><strong>{org.location || '—'}</strong></div>
          <div><span>✉️ Contact</span><strong>{org.contact?.email || '—'}</strong></div>
          <div><span>📞 Phone</span><strong>{org.contact?.phone || '—'}</strong></div>
          {org.officialWebsite && (
            <div>
              <span>🌐 Website</span>
              <strong>
                <a href={org.officialWebsite} target="_blank" rel="noopener noreferrer">
                  {org.officialWebsite.replace(/^https?:\/\//, '')} ↗
                </a>
              </strong>
            </div>
          )}
        </div>
        {!isSahaySeva && (
          <div className="alert alert-info" style={{ marginTop: '1rem' }}>
            This is an external listing — SahaySeva does not manage its volunteer applications.
            Please use its official website to get involved.
          </div>
        )}
      </div>

      {isSahaySeva && (
        <section className="section-sm">
          <h2 className="section-title">Volunteer Opportunities at {org.name}</h2>
          {message && <div className="alert alert-success">{message}</div>}
          {opportunities.length === 0 ? (
            <p className="muted">No opportunities posted yet. Check back soon!</p>
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
        </section>
      )}
    </div>
  );
};

export default OrganizationDetail;
