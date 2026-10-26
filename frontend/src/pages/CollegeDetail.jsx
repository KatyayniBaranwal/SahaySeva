import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import Badge from '../components/Badge';
import ProgramCard from '../components/ProgramCard';

const CollegeDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [joinedIds, setJoinedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = () => {
    client
      .get(`/institutes/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    if (user) {
      client
        .get('/participations/mine')
        .then((res) => setJoinedIds(new Set(res.data.participations.map((p) => p.program?._id))))
        .catch(() => {});
    }
  }, [user]);

  const join = async (programId) => {
    setMessage('');
    setError('');
    try {
      await client.post(`/programs/${programId}/join`);
      setJoinedIds((prev) => new Set(prev).add(programId));
      setMessage('Joined! The institute will verify your participation after the activity.');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loader />;
  if (error || !data)
    return (
      <div className="container page">
        <div className="alert alert-error">{error || 'Institute not found.'}</div>
        <Link to="/colleges" className="btn btn-outline">← Back to Colleges</Link>
      </div>
    );

  const { institute, programs } = data;

  return (
    <div className="container page">
      <Link to="/colleges" className="back-link">← Back to Colleges</Link>

      <div className="card detail-main">
        <div className="card-badges">
          <span className="badge badge-college">INSTITUTE</span>
          <Badge type={institute.verificationStatus === 'Verified' ? 'verified' : 'pending'}>
            {institute.verificationStatus === 'Verified' ? '✓ VERIFIED INSTITUTE' : institute.verificationStatus}
          </Badge>
        </div>
        <h1>{institute.name}</h1>
        <p className="detail-desc">{institute.description}</p>
        <div className="detail-facts">
          <div><span>📍 Location</span><strong>{institute.location || '—'}</strong></div>
          <div><span>✉️ Contact</span><strong>{institute.contact?.email || '—'}</strong></div>
          <div><span>📞 Phone</span><strong>{institute.contact?.phone || '—'}</strong></div>
        </div>
      </div>

      <section className="section-sm">
        <h2 className="section-title">Community-Service Programs</h2>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}
        {programs.length === 0 ? (
          <p className="muted">No programs listed yet.</p>
        ) : (
          <div className="grid grid-2">
            {programs.map((p) => (
              <ProgramCard
                key={p._id}
                program={p}
                userRole={user?.role}
                joined={joinedIds.has(p._id)}
                onJoin={user ? () => join(p._id) : undefined}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CollegeDetail;
