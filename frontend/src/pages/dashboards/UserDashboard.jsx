import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import RequestCard from '../../components/RequestCard';
import ServiceCard from '../../components/ServiceCard';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import StarRating from '../../components/StarRating';
import { ROLE_LABELS, ROLE_DASHBOARD_HINTS } from '../../utils/constants';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [saved, setSaved] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [reviewFor, setReviewFor] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  const load = () => {
    Promise.all([
      client.get('/stats/dashboard'),
      client.get('/requests?scope=mine'),
      client.get('/services/saved'),
      client.get('/reviews/mine'),
    ])
      .then(([s, r, sv, rv]) => {
        setStats(s.data.stats);
        setRequests(r.data.requests);
        setSaved(sv.data.services);
        setMyReviews(rv.data.reviews);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id, status) => {
    setMessage('');
    setError('');
    try {
      await client.put(`/requests/${id}/status`, { status });
      setMessage(`Request ${status.toLowerCase()}.`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteRequest = async (id) => {
    if (!window.confirm('Delete this help request?')) return;
    try {
      await client.delete(`/requests/${id}`);
      setMessage('Request deleted.');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await client.post('/reviews', {
        targetId: reviewFor.assignedProvider._id,
        requestId: reviewFor._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setMessage('Thanks! Your review has been posted.');
      setReviewFor(null);
      setReviewForm({ rating: 5, comment: '' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loader />;

  const reviewedRequestIds = new Set(myReviews.map((r) => r.helpRequest?._id));
  const active = requests.filter((r) => ['Pending', 'Accepted', 'In Progress'].includes(r.status));
  const completed = requests.filter((r) => r.status === 'Completed');

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Hi {user.name.split(' ')[0]} 👋</h1>
          <p className="page-sub">
            {ROLE_LABELS[user.role]} Dashboard — {ROLE_DASHBOARD_HINTS[user.role]}
          </p>
        </div>
        <Link to="/request-help" className="btn btn-primary">+ New Help Request</Link>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="grid grid-4 stat-row">
        <StatCard icon="📋" label="Total Requests" value={stats?.totalRequests ?? 0} />
        <StatCard icon="⏳" label="Active Requests" value={(stats?.pending ?? 0) + (stats?.accepted ?? 0) + (stats?.inProgress ?? 0)} tone="accent" />
        <StatCard icon="✅" label="Completed" value={stats?.completed ?? 0} tone="success" />
        <StatCard icon="❤️" label="Saved Services" value={stats?.saved ?? 0} tone="warn" />
      </div>

      <section className="dash-section">
        <h2 className="section-title">My Help Requests</h2>
        {requests.length === 0 ? (
          <EmptyState icon="📝" title="No requests yet" hint="Create your first help request to get started." />
        ) : (
          <div className="grid grid-2">
            {requests.map((r) => {
              const actions = [];
              if (r.status === 'Pending') {
                actions.push(
                  <button key="cancel" className="btn btn-outline btn-sm" onClick={() => updateStatus(r._id, 'Cancelled')}>
                    Cancel
                  </button>,
                  <button key="del" className="btn btn-danger btn-sm" onClick={() => deleteRequest(r._id)}>
                    Delete
                  </button>
                );
              }
              if (r.status === 'Accepted' || r.status === 'In Progress') {
                actions.push(
                  <button key="done" className="btn btn-primary btn-sm" onClick={() => updateStatus(r._id, 'Completed')}>
                    ✅ Mark Completed
                  </button>
                );
              }
              if (r.status === 'Completed' && r.assignedProvider && !reviewedRequestIds.has(r._id)) {
                actions.push(
                  <button key="review" className="btn btn-accent btn-sm" onClick={() => setReviewFor(r)}>
                    ⭐ Rate & Review
                  </button>
                );
              }
              if (r.status === 'Completed' && reviewedRequestIds.has(r._id)) {
                actions.push(<span key="revd" className="badge badge-verified">✓ Reviewed</span>);
              }
              return <RequestCard key={r._id} request={r} actions={actions.length ? actions : null} />;
            })}
          </div>
        )}
      </section>

      {reviewFor && (
        <section className="dash-section">
          <div className="card form-card form-stack">
            <h3>Rate “{reviewFor.assignedProvider.name}” for “{reviewFor.title}”</h3>
            <div className="field">
              <label>Rating</label>
              <StarRating value={reviewForm.rating} onChange={(n) => setReviewForm({ ...reviewForm, rating: n })} size="lg" />
            </div>
            <div className="field">
              <label htmlFor="rcomment">Your review</label>
              <textarea
                id="rcomment"
                rows={3}
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="How was the experience?"
              />
            </div>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={submitReview}>Post Review</button>
              <button className="btn btn-outline" onClick={() => setReviewFor(null)}>Cancel</button>
            </div>
          </div>
        </section>
      )}

      <section className="dash-section">
        <h2 className="section-title">Saved Services</h2>
        {saved.length === 0 ? (
          <EmptyState icon="❤️" title="Nothing saved yet" hint="Tap the heart on any service to save it here." />
        ) : (
          <div className="grid grid-3">
            {saved.map((s) => (
              <ServiceCard key={s._id} service={s} saved onSaveToggle={() => {}} />
            ))}
          </div>
        )}
      </section>

      <section className="dash-section">
        <h2 className="section-title">My Reviews</h2>
        {myReviews.length === 0 ? (
          <EmptyState icon="⭐" title="No reviews written yet" />
        ) : (
          <div className="review-list card">
            {myReviews.map((r) => (
              <div className="review-item" key={r._id}>
                <div className="review-head">
                  <div>
                    <strong>{r.target?.name || 'User'}</strong>
                    <div className="review-sub">{r.helpRequest?.title}</div>
                  </div>
                  <StarRating value={r.rating} />
                </div>
                {r.comment && <p className="review-comment">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default UserDashboard;
