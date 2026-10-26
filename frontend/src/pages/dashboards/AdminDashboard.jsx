import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import StatCard from '../../components/StatCard';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';
import { format_date } from '../../utils/constants';

const ROLE_FILTERS = ['all', 'user', 'provider', 'volunteer', 'ngo', 'college', 'admin'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState('all');
  const [organizations, setOrganizations] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = () => {
    Promise.all([
      client.get('/stats/dashboard'),
      client.get('/users'),
      client.get('/organizations'),
      client.get('/institutes'),
      client.get('/certificates'),
      client.get('/requests'),
    ])
      .then(([s, u, o, i, c, r]) => {
        setStats(s.data.stats);
        setUsers(u.data.users);
        setOrganizations(o.data.organizations);
        setInstitutes(i.data.institutes);
        setCertificates(c.data.certificates);
        setRequests(r.data.requests);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const deleteUser = async (id) => {
    if (!window.confirm('Remove this user?')) return;
    try {
      await client.delete(`/users/${id}`);
      setMessage('User removed.');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const verifyOrg = async (id, status) => {
    try {
      await client.post(`/organizations/${id}/verify`, { verificationStatus: status });
      setMessage(`Organization marked "${status}".`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const verifyInstitute = async (id, status) => {
    try {
      await client.post(`/institutes/${id}/verify`, { verificationStatus: status });
      setMessage(`Institute marked "${status}".`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleCert = async (c) => {
    try {
      await client.put(`/certificates/${c._id}/revoke`);
      setMessage(`Certificate ${c.certificateId} ${c.verificationStatus === 'Valid' ? 'revoked' : 'restored'}.`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteRequest = async (id) => {
    if (!window.confirm('Remove this request (moderation)?')) return;
    try {
      await client.delete(`/requests/${id}`);
      setMessage('Request removed.');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loader />;

  const shownUsers = userFilter === 'all' ? users : users.filter((u) => u.role === userFilter);

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="page-sub">Monitor and manage the whole platform.</p>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="grid grid-4 stat-row">
        <StatCard icon="👤" label="Total Users" value={stats?.totalUsers ?? 0} />
        <StatCard icon="🛠" label="Service Providers" value={stats?.providers ?? 0} />
        <StatCard icon="❤️" label="Volunteers" value={stats?.volunteers ?? 0} />
        <StatCard icon="🙋" label="Community Users" value={stats?.communityUsers ?? 0} />
        <StatCard icon="🏛" label="Organizations" value={stats?.organizations ?? 0} />
        <StatCard icon="✓" label="Verified Organizations" value={stats?.verifiedOrganizations ?? 0} tone="success" />
        <StatCard icon="🎓" label="Institutes" value={stats?.institutes ?? 0} />
        <StatCard icon="🛠" label="Listed Services" value={stats?.services ?? 0} />
        <StatCard icon="⏳" label="Active Requests" value={stats?.activeRequests ?? 0} tone="warn" />
        <StatCard icon="✅" label="Completed Requests" value={stats?.completedRequests ?? 0} tone="success" />
        <StatCard icon="⏱" label="Verified Volunteer Hours" value={stats?.volunteerHours ?? 0} />
        <StatCard icon="📜" label="Certificates Generated" value={stats?.certificates ?? 0} />
      </div>

      <section className="dash-section">
        <h2 className="section-title">Manage Users</h2>
        <div className="chip-row">
          {ROLE_FILTERS.map((r) => (
            <button
              key={r}
              className={`chip-btn ${userFilter === r ? 'active' : ''}`}
              onClick={() => setUserFilter(r)}
            >
              {r === 'all' ? 'All' : r}
            </button>
          ))}
        </div>
        <div className="table-wrap card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Location</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shownUsers.map((u) => (
                <tr key={u._id}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td><span className="badge badge-cat">{u.role}</span></td>
                  <td>{u.location || '—'}</td>
                  <td>{format_date(u.createdAt)}</td>
                  <td>
                    {u.role !== 'admin' && (
                      <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u._id)}>
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dash-section">
        <h2 className="section-title">Organizations — Verification</h2>
        <div className="table-wrap card">
          <table className="table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Type</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((o) => (
                <tr key={o._id}>
                  <td><strong>{o.name}</strong></td>
                  <td>{o.organizationType}</td>
                  <td>{o.location || '—'}</td>
                  <td>
                    <Badge type={o.verificationStatus === 'Verified' ? 'verified' : 'pending'}>
                      {o.verificationStatus}
                    </Badge>
                  </td>
                  <td>
                    <div className="btn-row">
                      {o.verificationStatus !== 'Verified' && (
                        <button className="btn btn-primary btn-sm" onClick={() => verifyOrg(o._id, 'Verified')}>
                          Verify
                        </button>
                      )}
                      {o.verificationStatus !== 'Rejected' && (
                        <button className="btn btn-danger btn-sm" onClick={() => verifyOrg(o._id, 'Rejected')}>
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dash-section">
        <h2 className="section-title">Institutes — Verification</h2>
        <div className="table-wrap card">
          <table className="table">
            <thead>
              <tr>
                <th>Institute</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {institutes.map((i) => (
                <tr key={i._id}>
                  <td><strong>{i.name}</strong></td>
                  <td>{i.location || '—'}</td>
                  <td>
                    <Badge type={i.verificationStatus === 'Verified' ? 'verified' : 'pending'}>
                      {i.verificationStatus}
                    </Badge>
                  </td>
                  <td>
                    <div className="btn-row">
                      {i.verificationStatus !== 'Verified' && (
                        <button className="btn btn-primary btn-sm" onClick={() => verifyInstitute(i._id, 'Verified')}>Verify</button>
                      )}
                      {i.verificationStatus !== 'Rejected' && (
                        <button className="btn btn-danger btn-sm" onClick={() => verifyInstitute(i._id, 'Rejected')}>Reject</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dash-section">
        <h2 className="section-title">Monitor Help Requests</h2>
        <div className="table-wrap card">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Requester</th>
                <th>Category</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id}>
                  <td><strong>{r.title}</strong><div className="muted small">{r.location}</div></td>
                  <td>{r.requester?.name}</td>
                  <td>{r.category}</td>
                  <td><Badge type={`urgency-${r.urgency.toLowerCase()}`}>{r.urgency}</Badge></td>
                  <td><Badge type={r.status.toLowerCase().replace(/\s+/g, '-')}>{r.status}</Badge></td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteRequest(r._id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dash-section">
        <h2 className="section-title">Monitor Certificates</h2>
        {certificates.length === 0 ? (
          <EmptyState icon="📜" title="No certificates yet" />
        ) : (
          <div className="table-wrap card">
            <table className="table">
              <thead>
                <tr>
                  <th>Certificate ID</th>
                  <th>Recipient</th>
                  <th>Issuer</th>
                  <th>Hours</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((c) => (
                  <tr key={c._id}>
                    <td><code>{c.certificateId}</code></td>
                    <td>{c.recipientName}</td>
                    <td>{c.issuer}</td>
                    <td>{c.serviceHours}</td>
                    <td>
                      <Badge type={c.verificationStatus === 'Valid' ? 'verified' : 'closed'}>
                        {c.verificationStatus}
                      </Badge>
                    </td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => toggleCert(c)}>
                        {c.verificationStatus === 'Valid' ? 'Revoke' : 'Restore'}
                      </button>
                    </td>
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

export default AdminDashboard;
