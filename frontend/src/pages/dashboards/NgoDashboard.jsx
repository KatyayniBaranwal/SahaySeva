import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';
import { ROLE_LABELS, ROLE_DASHBOARD_HINTS, CATEGORIES, format_date } from '../../utils/constants';

const emptyOppForm = {
  title: '',
  description: '',
  category: '',
  location: '',
  date: '',
  startTime: '',
  endTime: '',
  serviceHours: '',
  requiredVolunteers: '',
  certificateEligible: true,
  requirements: '',
};

const NgoDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [org, setOrg] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [oppForm, setOppForm] = useState(emptyOppForm);

  const load = () => {
    Promise.all([
      client.get('/stats/dashboard'),
      client.get('/opportunities?mine=1'),
      client.get('/applications'),
      client.get('/certificates'),
    ])
      .then(([s, o, a, c]) => {
        setStats(s.data.stats);
        setOpportunities(o.data.opportunities);
        setApplications(a.data.applications);
        setCertificates(c.data.certificates);
        return client.get(`/organizations`).then((all) => {
          const mine = all.data.organizations.find(
            (x) => x.owner && x.owner._id === user._id
          );
          if (mine) setOrg(mine);
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const createOpportunity = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await client.post('/opportunities', {
        ...oppForm,
        date: oppForm.date,
        serviceHours: Number(oppForm.serviceHours),
        requiredVolunteers: Number(oppForm.requiredVolunteers),
      });
      setMessage('Opportunity created and open for applications.');
      setShowForm(false);
      setOppForm(emptyOppForm);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateOppStatus = async (id, status) => {
    try {
      await client.put(`/opportunities/${id}`, { status });
      setMessage(`Opportunity marked ${status}.`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteOpp = async (id) => {
    if (!window.confirm('Delete this opportunity?')) return;
    try {
      await client.delete(`/opportunities/${id}`);
      setMessage('Opportunity deleted.');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateApplication = async (id, status) => {
    setError('');
    try {
      await client.put(`/applications/${id}`, { status });
      setMessage(
        status === 'Completed'
          ? 'Activity marked completed — participation verified with service hours.'
          : `Application ${status.toLowerCase()}.`
      );
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const generateCert = async (applicationId) => {
    setError('');
    try {
      const res = await client.post('/certificates/generate/application', { applicationId });
      setMessage(`Certificate ${res.data.certificate.certificateId} generated.`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loader />;

  const setF = (k) => (e) => setOppForm({ ...oppForm, [k]: e.target.value });
  const byOpp = (oppId) => applications.filter((a) => a.opportunity?._id === oppId);

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Organization Dashboard</h1>
          <p className="page-sub">{ROLE_LABELS[user.role]} — {ROLE_DASHBOARD_HINTS[user.role]}</p>
        </div>
        <div className="btn-row">
          {org && (
            <Link to={`/organizations/${org._id}`} className="btn btn-outline">
              View Public Page
            </Link>
          )}
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            + New Opportunity
          </button>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {org && (
        <div className="card org-profile-strip">
          <div>
            <h3>{org.name}</h3>
            <div className="card-meta">
              <span>📍 {org.location}</span>
              <span>🎯 {org.causes?.join(', ') || '—'}</span>
            </div>
          </div>
          <Badge type={org.verificationStatus === 'Verified' ? 'verified' : 'pending'}>
            {org.verificationStatus === 'Verified' ? '✓ VERIFIED ORGANIZATION' : org.verificationStatus}
          </Badge>
        </div>
      )}
      {!org && (
        <div className="alert alert-info">
          Your organization profile is being set up. Refresh in a moment or re-login.
        </div>
      )}

      <div className="grid grid-4 stat-row">
        <StatCard icon="📚" label="Opportunities" value={stats?.totalOpportunities ?? 0} />
        <StatCard icon="📢" label="Open Now" value={stats?.openOpportunities ?? 0} tone="accent" />
        <StatCard icon="📨" label="Pending Applications" value={stats?.pendingApplications ?? 0} tone="warn" />
        <StatCard icon="🤝" label="Accepted Volunteers" value={stats?.acceptedVolunteers ?? 0} />
        <StatCard icon="✅" label="Completed Activities" value={stats?.completedPrograms ?? 0} tone="success" />
        <StatCard icon="⏱" label="Verified Hours Given" value={stats?.verifiedHours ?? 0} tone="success" />
        <StatCard icon="📜" label="Certificates Issued" value={stats?.certificatesIssued ?? 0} />
      </div>

      {showForm && (
        <form className="card form-card form-stack dash-section" onSubmit={createOpportunity}>
          <h3>Create Volunteer Opportunity</h3>
          <div className="field">
            <label htmlFor="otitle">Title *</label>
            <input id="otitle" required value={oppForm.title} onChange={setF('title')} placeholder="e.g. Weekend Food Distribution Drive" />
          </div>
          <div className="field">
            <label htmlFor="odesc">Description *</label>
            <textarea id="odesc" required rows={3} value={oppForm.description} onChange={setF('description')} />
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="ocat">Category *</label>
              <select id="ocat" required value={oppForm.category} onChange={setF('category')}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="oloc2">Location *</label>
              <input id="oloc2" required value={oppForm.location} onChange={setF('location')} />
            </div>
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="odate">Date *</label>
              <input id="odate" type="date" required value={oppForm.date} onChange={setF('date')} />
            </div>
            <div className="field">
              <label htmlFor="ohours">Service Hours * (earned per volunteer)</label>
              <input id="ohours" type="number" step="0.5" min="0.5" required value={oppForm.serviceHours} onChange={setF('serviceHours')} />
            </div>
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="ostart">Start time</label>
              <input id="ostart" value={oppForm.startTime} onChange={setF('startTime')} placeholder="09:00" />
            </div>
            <div className="field">
              <label htmlFor="oend">End time</label>
              <input id="oend" value={oppForm.endTime} onChange={setF('endTime')} placeholder="13:00" />
            </div>
            <div className="field">
              <label htmlFor="oreq">Volunteers needed *</label>
              <input id="oreq" type="number" min="1" required value={oppForm.requiredVolunteers} onChange={setF('requiredVolunteers')} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="oreq2">Requirements / instructions (optional)</label>
            <textarea id="oreq2" rows={2} value={oppForm.requirements} onChange={setF('requirements')} placeholder="What should volunteers bring or know beforehand?" />
          </div>
          <label className="check-label">
            <input
              type="checkbox"
              checked={oppForm.certificateEligible}
              onChange={(e) => setOppForm({ ...oppForm, certificateEligible: e.target.checked })}
            />
            Certificate eligible — volunteers earn a certificate after verified completion
          </label>
          <div className="btn-row">
            <button className="btn btn-primary">Publish Opportunity</button>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <section className="dash-section">
        <h2 className="section-title">My Volunteer Opportunities</h2>
        {opportunities.length === 0 ? (
          <EmptyState icon="📢" title="No opportunities posted" hint="Create one to start recruiting volunteers." />
        ) : (
          <div className="table-wrap card">
            <table className="table">
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th>Date</th>
                  <th>Hours</th>
                  <th>Applicants</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((o) => (
                  <tr key={o._id}>
                    <td>
                      <strong>{o.title}</strong>
                      <div className="muted small">{o.location} {o.certificateEligible ? '· 📜 cert eligible' : '· no certificate'}</div>
                    </td>
                    <td>{format_date(o.date)}</td>
                    <td>{o.serviceHours}</td>
                    <td>{byOpp(o._id).length} / {o.requiredVolunteers}</td>
                    <td><Badge type={o.status === 'Open' ? 'open' : o.status === 'Completed' ? 'completed' : 'closed'}>{o.status}</Badge></td>
                    <td>
                      <div className="btn-row">
                        {o.status === 'Open' && (
                          <button className="btn btn-outline btn-sm" onClick={() => updateOppStatus(o._id, 'Closed')}>Close</button>
                        )}
                        {o.status === 'Closed' && (
                          <button className="btn btn-outline btn-sm" onClick={() => updateOppStatus(o._id, 'Completed')}>Mark Completed</button>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => deleteOpp(o._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="dash-section">
        <h2 className="section-title">Volunteer Applications</h2>
        {applications.length === 0 ? (
          <EmptyState icon="📨" title="No applications received yet" />
        ) : (
          <div className="table-wrap card">
            <table className="table">
              <thead>
                <tr>
                  <th>Volunteer</th>
                  <th>Opportunity</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => {
                  const certIssued = certificates.some(
                    (c) => c.sourceModel === 'VolunteerApplication' && String(c.sourceId) === String(a._id)
                  );
                  return (
                    <tr key={a._id}>
                      <td>
                        <strong>{a.volunteer?.name}</strong>
                        <div className="muted small">{a.volunteer?.email}</div>
                      </td>
                      <td>{a.opportunity?.title}</td>
                      <td>{format_date(a.appliedAt)}</td>
                      <td><Badge type={a.status === 'Completed' ? 'completed' : a.status.toLowerCase()}>{a.status}</Badge></td>
                      <td>
                        <div className="btn-row">
                          {a.status === 'Applied' && (
                            <>
                              <button className="btn btn-primary btn-sm" onClick={() => updateApplication(a._id, 'Accepted')}>Accept</button>
                              <button className="btn btn-danger btn-sm" onClick={() => updateApplication(a._id, 'Rejected')}>Reject</button>
                            </>
                          )}
                          {a.status === 'Accepted' && (
                            <button className="btn btn-outline btn-sm" onClick={() => updateApplication(a._id, 'Completed')}>
                              ✅ Mark Completed &amp; Verify Hours
                            </button>
                          )}
                          {a.status === 'Completed' && !certIssued && (
                            <button className="btn btn-accent btn-sm" onClick={() => generateCert(a._id)}>
                              📜 Generate Certificate
                            </button>
                          )}
                          {a.status === 'Completed' && certIssued && (
                            <span className="badge badge-verified">✓ Certificate issued</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="dash-section">
        <h2 className="section-title">Certificate Records</h2>
        {certificates.length === 0 ? (
          <EmptyState icon="📜" title="No certificates issued yet" />
        ) : (
          <div className="table-wrap card">
            <table className="table">
              <thead>
                <tr>
                  <th>Certificate ID</th>
                  <th>Recipient</th>
                  <th>Activity</th>
                  <th>Hours</th>
                  <th>Issued</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((c) => (
                  <tr key={c._id}>
                    <td><code>{c.certificateId}</code></td>
                    <td>{c.recipientName}</td>
                    <td>{c.activityName}</td>
                    <td>{c.serviceHours}</td>
                    <td>{format_date(c.completionDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default NgoDashboard;
