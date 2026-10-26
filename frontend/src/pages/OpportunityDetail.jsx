import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import Badge from '../components/Badge';
import { format_date } from '../utils/constants';

const OpportunityDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [myStatus, setMyStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = () => {
    client
      .get(`/opportunities/${id}`)
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
          const mine = res.data.applications.find((a) => a.opportunity?._id === id);
          if (mine) setMyStatus(mine.status);
        })
        .catch(() => {});
    }
  }, [user, id]);

  const apply = async () => {
    setError('');
    setMessage('');
    try {
      await client.post(`/applications/${id}/apply`);
      setMyStatus('Applied');
      setMessage('Application submitted! The organization will review it — track it in your dashboard.');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loader />;
  if (!data)
    return (
      <div className="container page">
        <div className="alert alert-error">{error || 'Opportunity not found.'}</div>
        <Link to="/volunteer" className="btn btn-outline">← Back to Volunteer Opportunities</Link>
      </div>
    );

  const { opportunity: o, acceptedCount } = data;
  const org = o.organization || {};
  const canApply = user && ['volunteer', 'user'].includes(user.role);
  const slotsLeft = Math.max(0, o.requiredVolunteers - acceptedCount);

  return (
    <div className="container page page-narrow">
      <Link to="/volunteer" className="back-link">← Back to Volunteer Opportunities</Link>

      <div className="card detail-main">
        <div className="card-badges">
          <span className="badge badge-volunteer">VOLUNTEERING</span>
          <Badge type="cat">{o.category}</Badge>
          {org.verificationStatus === 'Verified' && <Badge type="verified">✓ Verified Organization</Badge>}
          <Badge type={o.certificateEligible ? 'college' : 'cat'}>
            {o.certificateEligible ? '📜 Certificate Eligible' : 'No Certificate'}
          </Badge>
        </div>
        <h1>{o.title}</h1>
        <p className="detail-desc">{o.description}</p>

        {o.requirements && (
          <div className="form-note" style={{ marginBottom: '1.2rem' }}>
            <strong>Requirements / instructions:</strong> {o.requirements}
          </div>
        )}

        <div className="detail-facts">
          <div><span>🏛 Organization</span><strong>{org.name}</strong></div>
          <div><span>📍 Location</span><strong>{o.location}</strong></div>
          <div><span>📅 Date</span><strong>{format_date(o.date)}</strong></div>
          <div><span>🕐 Time</span><strong>{o.startTime}–{o.endTime}</strong></div>
          <div><span>⏱ Service Hours</span><strong>{o.serviceHours} hours</strong></div>
          <div>
            <span>👥 Volunteers</span>
            <strong>{acceptedCount} accepted / {o.requiredVolunteers} needed</strong>
            <div className="muted small">{slotsLeft > 0 ? `${slotsLeft} slot(s) left` : 'Volunteer slots are full.'}</div>
          </div>
          <div>
            <span>📜 Certificate</span>
            <strong>{o.certificateEligible ? 'Yes — after verified completion' : 'No'}</strong>
          </div>
          <div><span>📢 Status</span><strong>{o.status}</strong></div>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {!user && (
          <div className="alert alert-info">
            Please log in to apply for volunteer opportunities. <Link to="/login">Login</Link> or{' '}
            <Link to="/register">create an account</Link>.
          </div>
        )}

        {canApply &&
          (myStatus ? (
            <div>
              <button className="btn btn-lg" disabled>
                {myStatus === 'Accepted'
                  ? '✓ Accepted'
                  : myStatus === 'Completed'
                    ? '✓ Completed & Verified'
                    : myStatus === 'Rejected'
                      ? 'Application Rejected'
                      : '✓ Applied'}
              </button>
              <div className="muted small" style={{ marginTop: '0.5rem' }}>
                Status: Application {myStatus} — track it in your <Link to="/dashboard">dashboard</Link>.
              </div>
            </div>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={apply} disabled={o.status !== 'Open'}>
              {o.status === 'Open' ? '🙋 Apply to Volunteer' : 'Applications Closed'}
            </button>
          ))}
      </div>
    </div>
  );
};

export default OpportunityDetail;
