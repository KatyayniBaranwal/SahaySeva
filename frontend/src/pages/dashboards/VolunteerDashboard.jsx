import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';
import { ROLE_LABELS, ROLE_DASHBOARD_HINTS, format_date, rupees } from '../../utils/constants';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = () => {
    Promise.all([
      client.get('/stats/dashboard'),
      client.get('/applications/mine'),
      client.get('/participations/mine'),
      client.get('/certificates/mine'),
      client.get('/requests?scope=assigned'),
    ])
      .then(([s, a, p, c, j]) => {
        setStats(s.data.stats);
        setApplications(a.data.applications);
        setParticipations(p.data.participations);
        setCertificates(c.data.certificates);
        setMyJobs(j.data.requests);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const advanceJob = async (id, status) => {
    setError('');
    setMessage('');
    try {
      await client.put(`/requests/${id}/status`, { status });
      setMessage(`Help request marked as ${status}.`);
      load();
    } catch (err) {
      setError(err.message);
      load();
    }
  };

  if (loading) return <Loader />;

  const certBySource = {};
  certificates.forEach((c) => {
    if (c.sourceId) certBySource[c.sourceId] = c;
  });
  const participationByOpp = {};
  participations.forEach((p) => {
    if (p.opportunity?._id) participationByOpp[p.opportunity._id] = p;
  });
  const verifiedHours = participations
    .filter((p) => p.verificationStatus === 'Verified' && p.completionStatus === 'Completed')
    .reduce((sum, p) => sum + (p.serviceHours || 0), 0);

  const appStatusBadge = (status) =>
    status === 'Completed' ? 'completed' : status.toLowerCase();

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Volunteer Dashboard</h1>
          <p className="page-sub">
            {ROLE_LABELS[user.role]} — {ROLE_DASHBOARD_HINTS[user.role]}
            {user.affiliatedInstitute && <span> · Affiliated to an institute 🎓</span>}
          </p>
        </div>
        <Link to="/volunteer" className="btn btn-primary">Browse Opportunities</Link>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="grid grid-4 stat-row">
        <StatCard icon="⏱" label="Verified Service Hours" value={stats?.totalHours ?? 0} tone="success" />
        <StatCard icon="🙋" label="Accepted Help Requests" value={stats?.acceptedHelpRequests ?? 0} tone="accent" />
        <StatCard icon="📨" label="Applied" value={stats?.applied ?? 0} />
        <StatCard icon="✅" label="Completed Activities" value={stats?.completedApps ?? 0} tone="success" />
        <StatCard icon="🎓" label="Programs Joined" value={stats?.enrolled ?? 0} />
        <StatCard icon="📜" label="Certificates" value={stats?.certificates ?? 0} tone="warn" />
      </div>

      <section className="dash-section">
        <h2 className="section-title">My Accepted Help Requests</h2>
        {myJobs.filter((r) => r.status !== 'Cancelled').length === 0 ? (
          <EmptyState
            icon="🙋"
            title="No accepted help requests yet"
            hint="Accept one from the Help Requests page and it will appear here."
          />
        ) : (
          <div className="grid grid-2">
            {myJobs
              .filter((r) => r.status !== 'Cancelled')
              .map((r) => (
                <article className="card app-card" key={r._id}>
                  <div className="card-badges">
                    <span className={`badge ${r.pricingType === 'Free' ? 'badge-free' : 'badge-paid'}`}>
                      {r.pricingType === 'Free' ? 'FREE HELP' : `PAID · up to ${rupees(r.budget)}`}
                    </span>
                    <Badge type={`urgency-${r.urgency.toLowerCase()}`}>{r.urgency}</Badge>
                    <Badge type={r.status.toLowerCase().replace(/\s+/g, '-')}>{r.status}</Badge>
                  </div>
                  <h3 className="card-title">{r.title}</h3>
                  <div className="card-meta">
                    <span>👤 Requester: {r.requester?.name || '—'}</span>
                    <span>🏷 {r.category}</span>
                    <span>📍 {r.location}</span>
                    {r.preferredDate && (
                      <span>📅 {format_date(r.preferredDate)}{r.preferredTime ? ` · ${r.preferredTime}` : ''}</span>
                    )}
                    {r.acceptedAt && <span>🤝 Accepted on {format_date(r.acceptedAt)}</span>}
                  </div>
                  <div className="card-footer card-footer-actions">
                    {r.status === 'Accepted' && (
                      <button className="btn btn-outline btn-sm" onClick={() => advanceJob(r._id, 'In Progress')}>
                        ▶ Start (In Progress)
                      </button>
                    )}
                    {['Accepted', 'In Progress'].includes(r.status) && (
                      <button className="btn btn-primary btn-sm" onClick={() => advanceJob(r._id, 'Completed')}>
                        ✅ Mark Completed
                      </button>
                    )}
                    {r.status === 'Completed' && (
                      <span className="badge badge-completed">✓ Completed — awaiting requester review</span>
                    )}
                  </div>
                </article>
              ))}
          </div>
        )}
      </section>

      <section className="dash-section">
        <h2 className="section-title">My Volunteer Applications</h2>
        {applications.length === 0 ? (
          <EmptyState icon="📨" title="No applications yet" hint="Browse volunteer opportunities and click “Apply to Volunteer”." />
        ) : (
          <div className="grid grid-2">
            {applications.map((a) => {
              const o = a.opportunity || {};
              const part = participationByOpp[o._id];
              const cert = certBySource[a._id];
              return (
                <article className="card app-card" key={a._id}>
                  <div className="card-badges">
                    <Badge type={`app-${a.status.toLowerCase()}`}>{a.status}</Badge>
                    {part && (
                      <Badge type={part.verificationStatus === 'Verified' ? 'verified' : 'pending'}>
                        Participation: {part.verificationStatus === 'Verified' ? 'Verified ✓' : part.verificationStatus}
                      </Badge>
                    )}
                  </div>
                  <h3 className="card-title">
                    <Link to={`/volunteer/${o._id}`}>{o.title}</Link>
                  </h3>
                  <div className="card-meta">
                    <span>🏛 {o.organization?.name || '—'}</span>
                    <span>🏷 {o.category || '—'}</span>
                    <span>📍 {o.location || '—'}</span>
                    <span>📅 {format_date(o.date)}</span>
                    <span>🕐 {o.startTime}–{o.endTime}</span>
                    <span>⏱ {o.serviceHours} service hours</span>
                  </div>
                  <div className="app-status-row">
                    <div>
                      <span>Application Status:</span>
                      <strong>{a.status}</strong>
                    </div>
                    <div>
                      <span>Participation:</span>
                      <strong>
                        {part
                          ? part.verificationStatus === 'Verified'
                            ? 'Verified ✓'
                            : part.verificationStatus
                          : o.status === 'Open' || a.status !== 'Completed'
                            ? 'Pending Verification'
                            : '—'}
                      </strong>
                    </div>
                    <div>
                      <span>Certificate:</span>
                      {cert ? (
                        <Link to={`/verify-certificate?id=${cert.certificateId}`}>
                          Available ({cert.certificateId})
                        </Link>
                      ) : a.status === 'Completed' && o.certificateEligible !== false ? (
                        <strong>Pending — awaiting organization</strong>
                      ) : (
                        <strong>—</strong>
                      )}
                    </div>
                  </div>
                  <div className="card-footer card-footer-actions">
                    <Link to={`/volunteer/${o._id}`} className="btn btn-outline btn-sm">View Opportunity</Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="dash-section">
        <h2 className="section-title">My College Programs</h2>
        {participations.filter((p) => p.program).length === 0 ? (
          <EmptyState icon="🎓" title="No college programs joined" hint="Institute programs you join appear here." />
        ) : (
          <div className="grid grid-2">
            {participations
              .filter((p) => p.program)
              .map((p) => {
                const cert = certBySource[p._id];
                return (
                  <article className="card" key={p._id}>
                    <div className="card-badges">
                      <span className="badge badge-college">COLLEGE PROGRAM</span>
                      <Badge type={p.completionStatus === 'Completed' ? 'completed' : 'pending'}>
                        {p.completionStatus}
                      </Badge>
                      <Badge type={p.verificationStatus === 'Verified' ? 'verified' : 'pending'}>
                        {p.verificationStatus === 'Verified' ? 'Hours Verified ✓' : p.verificationStatus}
                      </Badge>
                    </div>
                    <h3 className="card-title">{p.program?.title}</h3>
                    <div className="card-meta">
                      <span>🎓 {p.institute?.name}</span>
                      <span>🏷 {p.program?.category || '—'}</span>
                      <span>📍 {p.program?.location || p.institute?.location || '—'}</span>
                      <span>📅 {format_date(p.program?.date)}</span>
                      <span>⏱ {p.serviceHours} service hours</span>
                    </div>
                    <div className="card-footer card-footer-actions">
                      {cert ? (
                        <Link to={`/verify-certificate?id=${cert.certificateId}`} className="btn btn-accent btn-sm">
                          📜 Certificate Available
                        </Link>
                      ) : (
                        <span className="muted small">Certificate after verified completion</span>
                      )}
                    </div>
                  </article>
                );
              })}
          </div>
        )}
      </section>

      <section className="dash-section">
        <h2 className="section-title">Service Hours Ledger</h2>
        {participations.length === 0 ? (
          <EmptyState icon="📖" title="No activities recorded yet" />
        ) : (
          <div className="table-wrap card">
            <table className="table">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>By</th>
                  <th>Type</th>
                  <th>Hours</th>
                  <th>Completion</th>
                  <th>Verification</th>
                </tr>
              </thead>
              <tbody>
                {participations.map((p) => (
                  <tr key={p._id}>
                    <td><strong>{p.program?.title || p.opportunity?.title || 'Activity'}</strong></td>
                    <td>{p.institute?.name || p.organization?.name || '—'}</td>
                    <td>{p.program ? 'College Program' : 'NGO Activity'}</td>
                    <td>{p.serviceHours}</td>
                    <td><Badge type={p.completionStatus === 'Completed' ? 'completed' : 'pending'}>{p.completionStatus}</Badge></td>
                    <td>
                      <Badge type={p.verificationStatus === 'Verified' ? 'verified' : 'pending'}>
                        {p.verificationStatus === 'Verified' ? '✓ Verified' : p.verificationStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="hours-banner">
          ⏱ Total verified service hours: <strong>{verifiedHours}</strong>
        </div>
      </section>

      <section className="dash-section">
        <h2 className="section-title">My Certificates</h2>
        {certificates.length === 0 ? (
          <EmptyState
            icon="📜"
            title="No certificates yet"
            hint="Certificates are issued for structured programs — ordinary community help doesn't need one."
          />
        ) : (
          <div className="grid grid-3">
            {certificates.map((c) => (
              <div className="card cert-mini" key={c._id}>
                <span className="cert-label">COMMUNITY SERVICE</span>
                <strong>{c.activityName}</strong>
                <span>{c.serviceHours} hours · {format_date(c.completionDate)}</span>
                <span className="muted">Issued by {c.issuer}</span>
                <span className="cert-id">{c.certificateId}</span>
                <Link to={`/verify-certificate?id=${c.certificateId}`} className="btn btn-outline btn-sm">
                  View / Verify
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default VolunteerDashboard;
