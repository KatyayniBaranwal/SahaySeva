import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';
import { ROLE_LABELS, ROLE_DASHBOARD_HINTS, CATEGORIES, format_date } from '../../utils/constants';

const emptyProgramForm = {
  title: '',
  description: '',
  category: '',
  location: '',
  date: '',
  startTime: '',
  endTime: '',
  serviceHours: '',
  requiredStudents: '',
};

const CollegeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [institute, setInstitute] = useState(null);
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [programForm, setProgramForm] = useState(emptyProgramForm);
  const [studentForm, setStudentForm] = useState({ name: '', email: '', phone: '' });

  const load = () => {
    Promise.all([
      client.get('/stats/dashboard'),
      client.get('/institutes/me/institute'),
      client.get('/programs?mine=1'),
      client.get('/participations'),
      client.get('/certificates'),
    ])
      .then(async ([s, i, p, part, c]) => {
        setStats(s.data.stats);
        setInstitute(i.data.institute);
        setPrograms(p.data.programs);
        setParticipations(part.data.participations);
        setCertificates(c.data.certificates);
        const st = await client.get(`/institutes/${i.data.institute._id}/students`);
        setStudents(st.data.students);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const createProgram = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await client.post('/programs', {
        ...programForm,
        serviceHours: Number(programForm.serviceHours),
        requiredStudents: Number(programForm.requiredStudents),
      });
      setMessage('Program created — students can now join.');
      setShowForm(false);
      setProgramForm(emptyProgramForm);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const addStudent = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await client.post(`/institutes/${institute._id}/students`, studentForm);
      setMessage(res.data.message);
      setStudentForm({ name: '', email: '', phone: '' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const verifyParticipation = async (p) => {
    setError('');
    try {
      await client.put(`/participations/${p._id}`, {
        completionStatus: 'Completed',
        verificationStatus: 'Verified',
      });
      setMessage(`Participation completed & verified for ${p.participant?.name} (+${p.serviceHours} hours).`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const generateCert = async (participationId) => {
    setError('');
    try {
      const res = await client.post('/certificates/generate/participation', { participationId });
      setMessage(`Certificate ${res.data.certificate.certificateId} generated.`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteProgram = async (id) => {
    if (!window.confirm('Delete this program?')) return;
    try {
      await client.delete(`/programs/${id}`);
      setMessage('Program deleted.');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loader />;

  const setF = (k) => (e) => setProgramForm({ ...programForm, [k]: e.target.value });

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>College Dashboard</h1>
          <p className="page-sub">{ROLE_LABELS[user.role]} — {ROLE_DASHBOARD_HINTS[user.role]}</p>
        </div>
        <div className="btn-row">
          {institute && (
            <Link to={`/colleges/${institute._id}`} className="btn btn-outline">View Public Page</Link>
          )}
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Program</button>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {institute && (
        <div className="card org-profile-strip">
          <div>
            <h3>{institute.name}</h3>
            <div className="card-meta">
              <span>📍 {institute.location}</span>
              <span>✉️ {institute.contact?.email}</span>
            </div>
          </div>
          <Badge type={institute.verificationStatus === 'Verified' ? 'verified' : 'pending'}>
            {institute.verificationStatus === 'Verified' ? '✓ VERIFIED INSTITUTE' : institute.verificationStatus}
          </Badge>
        </div>
      )}

      <div className="grid grid-4 stat-row">
        <StatCard icon="👥" label="Affiliated Students" value={stats?.students ?? 0} />
        <StatCard icon="📚" label="Programs" value={stats?.totalPrograms ?? 0} />
        <StatCard icon="📢" label="Open Programs" value={stats?.openPrograms ?? 0} tone="accent" />
        <StatCard icon="🎒" label="Currently Enrolled" value={stats?.enrolledStudents ?? 0} tone="warn" />
        <StatCard icon="✅" label="Completed Participations" value={stats?.completedParticipations ?? 0} tone="success" />
        <StatCard icon="⏱" label="Verified Hours" value={stats?.verifiedHours ?? 0} tone="success" />
        <StatCard icon="📜" label="Certificates Issued" value={stats?.certificatesIssued ?? 0} />
      </div>

      {showForm && (
        <form className="card form-card form-stack dash-section" onSubmit={createProgram}>
          <h3>Create Community-Service Program</h3>
          <div className="field">
            <label htmlFor="prtitle">Title *</label>
            <input id="prtitle" required value={programForm.title} onChange={setF('title')} placeholder="e.g. Community Teaching Drive" />
          </div>
          <div className="field">
            <label htmlFor="prdesc">Description *</label>
            <textarea id="prdesc" required rows={3} value={programForm.description} onChange={setF('description')} />
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="prcat">Category *</label>
              <select id="prcat" required value={programForm.category} onChange={setF('category')}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="prloc">Location *</label>
              <input id="prloc" required value={programForm.location} onChange={setF('location')} />
            </div>
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="prdate">Date *</label>
              <input id="prdate" type="date" required value={programForm.date} onChange={setF('date')} />
            </div>
            <div className="field">
              <label htmlFor="prhours">Service Hours *</label>
              <input id="prhours" type="number" step="0.5" min="0.5" required value={programForm.serviceHours} onChange={setF('serviceHours')} />
            </div>
            <div className="field">
              <label htmlFor="prreq">Students needed *</label>
              <input id="prreq" type="number" min="1" required value={programForm.requiredStudents} onChange={setF('requiredStudents')} />
            </div>
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="prstart">Start time</label>
              <input id="prstart" value={programForm.startTime} onChange={setF('startTime')} placeholder="09:00" />
            </div>
            <div className="field">
              <label htmlFor="prend">End time</label>
              <input id="prend" value={programForm.endTime} onChange={setF('endTime')} placeholder="13:00" />
            </div>
          </div>
          <div className="btn-row">
            <button className="btn btn-primary">Publish Program</button>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <section className="dash-section">
        <h2 className="section-title">My Programs</h2>
        {programs.length === 0 ? (
          <EmptyState icon="📚" title="No programs yet" hint="Create a community-service program for your students." />
        ) : (
          <div className="table-wrap card">
            <table className="table">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Date</th>
                  <th>Hours</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((p) => {
                  const enrolled = participations.filter((x) => x.program?._id === p._id).length;
                  return (
                    <tr key={p._id}>
                      <td><strong>{p.title}</strong><div className="muted small">{p.location}</div></td>
                      <td>{format_date(p.date)}</td>
                      <td>{p.serviceHours}</td>
                      <td>{enrolled} / {p.requiredStudents}</td>
                      <td><Badge type={p.status === 'Open' ? 'open' : p.status === 'Completed' ? 'completed' : 'closed'}>{p.status}</Badge></td>
                      <td>
                        <div className="btn-row">
                          {p.status === 'Open' && (
                            <button className="btn btn-outline btn-sm" onClick={() => client.put(`/programs/${p._id}`, { status: 'Closed' }).then(load)}>Close</button>
                          )}
                          <button className="btn btn-danger btn-sm" onClick={() => deleteProgram(p._id)}>Delete</button>
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
        <h2 className="section-title">Student Participation</h2>
        {participations.length === 0 ? (
          <EmptyState icon="🎒" title="No student participations yet" />
        ) : (
          <div className="table-wrap card">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Program</th>
                  <th>Hours</th>
                  <th>Completion</th>
                  <th>Verification</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {participations.map((p) => {
                  const certIssued = certificates.some(
                    (c) => c.sourceModel === 'Participation' && String(c.sourceId) === String(p._id)
                  );
                  return (
                    <tr key={p._id}>
                      <td>
                        <strong>{p.participant?.name}</strong>
                        <div className="muted small">{p.participant?.email}</div>
                      </td>
                      <td>{p.program?.title}</td>
                      <td>{p.serviceHours}</td>
                      <td>
                        <Badge type={p.completionStatus === 'Completed' ? 'completed' : 'pending'}>
                          {p.completionStatus}
                        </Badge>
                      </td>
                      <td>
                        <Badge type={p.verificationStatus === 'Verified' ? 'verified' : 'pending'}>
                          {p.verificationStatus === 'Verified' ? '✓ Verified' : p.verificationStatus}
                        </Badge>
                      </td>
                      <td>
                        <div className="btn-row">
                          {p.completionStatus !== 'Completed' && (
                            <button className="btn btn-primary btn-sm" onClick={() => verifyParticipation(p)}>
                              ✅ Mark Completed &amp; Verify
                            </button>
                          )}
                          {p.completionStatus === 'Completed' && p.verificationStatus === 'Verified' && !certIssued && (
                            <button className="btn btn-accent btn-sm" onClick={() => generateCert(p._id)}>
                              📜 Generate Certificate
                            </button>
                          )}
                          {certIssued && <span className="badge badge-verified">✓ Certificate issued</span>}
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
        <h2 className="section-title">Affiliated Students</h2>
        <form className="card form-inline" onSubmit={addStudent}>
          <div className="field">
            <label htmlFor="sname">Student name</label>
            <input id="sname" required value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="semail">Email</label>
            <input id="semail" type="email" required value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="sphone">Phone</label>
            <input id="sphone" value={studentForm.phone} onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })} />
          </div>
          <button className="btn btn-primary">+ Add Student</button>
        </form>
        <p className="muted small">
          Students get a volunteer account (default password <code>Student@123</code>) linked to your institute, so their service records stay with them.
        </p>
        {students.length === 0 ? (
          <EmptyState icon="👥" title="No affiliated students yet" />
        ) : (
          <div className="table-wrap card">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}>
                    <td><strong>{s.name}</strong></td>
                    <td>{s.email}</td>
                    <td>{s.phone || '—'}</td>
                    <td>{format_date(s.createdAt)}</td>
                  </tr>
                ))}
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
                  <th>Completed</th>
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

export default CollegeDashboard;
