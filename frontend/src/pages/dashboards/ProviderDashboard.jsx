import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import RequestCard from '../../components/RequestCard';
import StarRating from '../../components/StarRating';
import ReviewCard from '../../components/ReviewCard';
import { ROLE_LABELS, ROLE_DASHBOARD_HINTS, CATEGORIES, rupees, format_date } from '../../utils/constants';

const emptyServiceForm = {
  title: '',
  description: '',
  category: '',
  location: '',
  pricingType: 'Free',
  price: '',
  availability: '',
};

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [openRequests, setOpenRequests] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [profileForm, setProfileForm] = useState(null);

  const load = () => {
    Promise.all([
      client.get('/stats/dashboard'),
      client.get('/providers/me/profile'),
      client.get('/services'),
      client.get('/requests?scope=open'),
      client.get('/requests?scope=assigned'),
      client.get(`/reviews?targetId=${user._id}`),
    ])
      .then(([s, p, sv, open, assigned, rv]) => {
        setStats(s.data.stats);
        setProfile(p.data.provider);
        setServices(sv.data.services.filter((x) => String(x.provider?.user?._id) === String(user._id)));
        setOpenRequests(open.data.requests);
        const mine = assigned.data.requests;
        setActiveJobs(mine.filter((r) => ['Accepted', 'In Progress'].includes(r.status)));
        setCompletedJobs(mine.filter((r) => r.status === 'Completed'));
        setReviews(rv.data.reviews);
        setProfileForm({
          description: p.data.provider.description || '',
          category: p.data.provider.category || 'Other',
          location: p.data.provider.location || '',
          availability: p.data.provider.availability || '',
          pricingType: p.data.provider.pricingType || 'Free',
          price: p.data.provider.price || '',
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const saveService = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...serviceForm,
        price: serviceForm.pricingType === 'Paid' ? Number(serviceForm.price) : 0,
      };
      if (editingId) {
        await client.put(`/services/${editingId}`, payload);
        setMessage('Service updated.');
      } else {
        await client.post('/services', payload);
        setMessage('Service added.');
      }
      setShowServiceForm(false);
      setEditingId(null);
      setServiceForm(emptyServiceForm);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const editService = (s) => {
    setEditingId(s._id);
    setServiceForm({
      title: s.title,
      description: s.description,
      category: s.category,
      location: s.location,
      pricingType: s.pricingType,
      price: s.price || '',
      availability: s.availability || '',
    });
    setShowServiceForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await client.delete(`/services/${id}`);
      setMessage('Service deleted.');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleStatus = async (s) => {
    try {
      await client.put(`/services/${s._id}`, { status: s.status === 'Active' ? 'Inactive' : 'Active' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      await client.put('/providers/me/profile', {
        ...profileForm,
        price: profileForm.pricingType === 'Paid' ? Number(profileForm.price) : 0,
      });
      setMessage('Provider profile updated.');
      setShowProfileForm(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const accept = async (id) => {
    setError('');
    try {
      await client.put(`/requests/${id}/status`, { status: 'Accepted' });
      setMessage('Request accepted!');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const advance = async (id, status) => {
    try {
      await client.put(`/requests/${id}/status`, { status });
      setMessage(`Marked as ${status}.`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loader />;

  const setSF = (k) => (e) => setServiceForm({ ...serviceForm, [k]: e.target.value });
  const setPF = (k) => (e) => setProfileForm({ ...profileForm, [k]: e.target.value });

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Service Provider Dashboard</h1>
          <p className="page-sub">
            {ROLE_LABELS[user.role]} — {ROLE_DASHBOARD_HINTS[user.role]}
          </p>
        </div>
        <div className="btn-row">
          <button className="btn btn-outline" onClick={() => setShowProfileForm(!showProfileForm)}>
            ⚙️ My Profile
          </button>
          <button className="btn btn-primary" onClick={() => { setShowServiceForm(!showServiceForm); setEditingId(null); setServiceForm(emptyServiceForm); }}>
            + Add Service
          </button>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="grid grid-4 stat-row">
        <StatCard icon="🛠" label="My Services" value={stats?.myServices ?? 0} />
        <StatCard icon="📥" label="Open Requests" value={stats?.openRequests ?? 0} tone="warn" />
        <StatCard icon="🔧" label="Active Jobs" value={stats?.activeJobs ?? 0} tone="accent" />
        <StatCard icon="✅" label="Completed" value={stats?.completedJobs ?? 0} tone="success" />
        <StatCard icon="💰" label="Paid Earnings" value={rupees(stats?.earnings ?? 0)} />
        <StatCard icon="⭐" label="Rating" value={stats?.rating ? `${stats.rating} / 5` : 'New'} />
        <StatCard icon="📝" label="Reviews" value={stats?.reviews ?? 0} />
        <StatCard icon="🏆" label="Lifetime Jobs" value={stats?.completedServices ?? 0} />
      </div>

      {showProfileForm && profileForm && (
        <form className="card form-card form-stack dash-section" onSubmit={saveProfile}>
          <h3>Provider Profile</h3>
          <div className="field">
            <label htmlFor="pdesc">Description</label>
            <textarea id="pdesc" rows={2} value={profileForm.description} onChange={setPF('description')} />
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="pcat2">Main Category</label>
              <select id="pcat2" value={profileForm.category} onChange={setPF('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="ploc2">Location</label>
              <input id="ploc2" value={profileForm.location} onChange={setPF('location')} />
            </div>
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="pav">Availability</label>
              <input id="pav" value={profileForm.availability} onChange={setPF('availability')} placeholder="e.g. Mon-Sat, 9 AM to 6 PM" />
            </div>
            <div className="field">
              <label htmlFor="ppt">Pricing</label>
              <select id="ppt" value={profileForm.pricingType} onChange={setPF('pricingType')}>
                <option value="Free">Free</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>
          {profileForm.pricingType === 'Paid' && (
            <div className="field">
              <label htmlFor="pprice">Starting price (₹)</label>
              <input id="pprice" type="number" min="0" value={profileForm.price} onChange={setPF('price')} />
            </div>
          )}
          <div className="btn-row">
            <button className="btn btn-primary">Save Profile</button>
            <button type="button" className="btn btn-outline" onClick={() => setShowProfileForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {showServiceForm && (
        <form className="card form-card form-stack dash-section" onSubmit={saveService}>
          <h3>{editingId ? 'Edit Service' : 'Add a New Service'}</h3>
          <div className="field">
            <label htmlFor="stitle">Title *</label>
            <input id="stitle" required value={serviceForm.title} onChange={setSF('title')} placeholder="e.g. Computer Repair at Home" />
          </div>
          <div className="field">
            <label htmlFor="sdesc">Description *</label>
            <textarea id="sdesc" required rows={3} value={serviceForm.description} onChange={setSF('description')} />
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="scat">Category *</label>
              <select id="scat" required value={serviceForm.category} onChange={setSF('category')}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="sloc">Location *</label>
              <input id="sloc" required value={serviceForm.location} onChange={setSF('location')} />
            </div>
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="sptype">Free or Paid? *</label>
              <select id="sptype" value={serviceForm.pricingType} onChange={setSF('pricingType')}>
                <option value="Free">FREE service</option>
                <option value="Paid">PAID service</option>
              </select>
            </div>
            {serviceForm.pricingType === 'Paid' && (
              <div className="field">
                <label htmlFor="sprice">Price (₹) *</label>
                <input id="sprice" type="number" min="1" required value={serviceForm.price} onChange={setSF('price')} />
              </div>
            )}
          </div>
          <div className="field">
            <label htmlFor="sav">Availability</label>
            <input id="sav" value={serviceForm.availability} onChange={setSF('availability')} placeholder="e.g. Weekends, 10 AM to 1 PM" />
          </div>
          <div className="btn-row">
            <button className="btn btn-primary">{editingId ? 'Update Service' : 'Add Service'}</button>
            <button type="button" className="btn btn-outline" onClick={() => { setShowServiceForm(false); setEditingId(null); }}>Cancel</button>
          </div>
        </form>
      )}

      <section className="dash-section">
        <h2 className="section-title">My Services</h2>
        {services.length === 0 ? (
          <EmptyState icon="🛠" title="No services listed" hint="Add your first service to start receiving requests." />
        ) : (
          <div className="table-wrap card">
            <table className="table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <strong>{s.title}</strong>
                      <div className="muted small">{s.location}</div>
                    </td>
                    <td>{s.category}</td>
                    <td>
                      <span className={`badge ${s.pricingType === 'Free' ? 'badge-free' : 'badge-paid'}`}>
                        {s.pricingType === 'Free' ? 'FREE' : `₹${s.price}`}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${s.status === 'Active' ? 'badge-open' : 'badge-closed'}`}>{s.status}</span>
                    </td>
                    <td>
                      <div className="btn-row">
                        <button className="btn btn-outline btn-sm" onClick={() => toggleStatus(s)}>
                          {s.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={() => editService(s)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteService(s._id)}>Delete</button>
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
        <h2 className="section-title">Incoming Requests</h2>
        {openRequests.length === 0 ? (
          <EmptyState icon="📭" title="No open requests right now" />
        ) : (
          <div className="grid grid-2">
            {openRequests.map((r) => (
              <RequestCard
                key={r._id}
                request={r}
                actions={
                  <button className="btn btn-primary btn-sm" onClick={() => accept(r._id)}>🤝 Accept</button>
                }
              />
            ))}
          </div>
        )}
      </section>

      <section className="dash-section">
        <h2 className="section-title">Active Services</h2>
        {activeJobs.length === 0 ? (
          <EmptyState icon="🔧" title="No active jobs" hint="Accept an open request to get started." />
        ) : (
          <div className="grid grid-2">
            {activeJobs.map((r) => (
              <RequestCard
                key={r._id}
                request={r}
                showRequester={false}
                actions={
                  <>
                    {r.status === 'Accepted' && (
                      <button className="btn btn-outline btn-sm" onClick={() => advance(r._id, 'In Progress')}>
                        ▶ Start (In Progress)
                      </button>
                    )}
                    <button className="btn btn-primary btn-sm" onClick={() => advance(r._id, 'Completed')}>
                      ✅ Mark Completed
                    </button>
                  </>
                }
              />
            ))}
          </div>
        )}
      </section>

      <section className="dash-section">
        <h2 className="section-title">Completed Services</h2>
        {completedJobs.length === 0 ? (
          <EmptyState icon="✅" title="No completed services yet" />
        ) : (
          <div className="grid grid-2">
            {completedJobs.map((r) => (
              <RequestCard key={r._id} request={r} showRequester={false} />
            ))}
          </div>
        )}
      </section>

      <section className="dash-section">
        <h2 className="section-title">Ratings &amp; Reviews</h2>
        {reviews.length === 0 ? (
          <EmptyState icon="⭐" title="No reviews yet" hint="Complete services to earn reviews." />
        ) : (
          <div className="review-list card">
            {reviews.map((r) => (
              <ReviewCard key={r._id} review={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProviderDashboard;
