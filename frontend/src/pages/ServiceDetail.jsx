import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import StarRating from '../components/StarRating';
import ReviewCard from '../components/ReviewCard';
import EmptyState from '../components/EmptyState';
import { rupees } from '../utils/constants';

const ServiceDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    client
      .get(`/services/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (error || !data)
    return (
      <div className="container page">
        <div className="alert alert-error">{error || 'Service not found.'}</div>
        <Link to="/services" className="btn btn-outline">← Back to services</Link>
      </div>
    );

  const { service, reviews } = data;
  const providerUser = service.provider?.user;

  return (
    <div className="container page">
      <Link to="/services" className="back-link">← Back to Services</Link>

      <div className="detail-layout">
        <div className="card detail-main">
          <div className="card-badges">
            <span className={`badge ${service.pricingType === 'Free' ? 'badge-free' : 'badge-paid'}`}>
              {service.pricingType === 'Free' ? 'FREE SERVICE' : `PAID SERVICE · ${rupees(service.price)}`}
            </span>
            <span className="badge badge-cat">{service.category}</span>
            <span className={`badge ${service.status === 'Active' ? 'badge-open' : 'badge-closed'}`}>
              {service.status}
            </span>
          </div>
          <h1>{service.title}</h1>
          <p className="detail-desc">{service.description}</p>
          <div className="detail-facts">
            <div><span>📍 Location</span><strong>{service.location}</strong></div>
            <div><span>🕘 Availability</span><strong>{service.availability || 'Flexible'}</strong></div>
            <div>
              <span>💰 Charges</span>
              <strong>{service.pricingType === 'Free' ? 'Free of cost' : `${rupees(service.price)} (negotiable)`}</strong>
            </div>
            <div>
              <span>⭐ Rating</span>
              <strong>
                <StarRating value={service.provider?.rating || 0} count={service.provider?.numReviews} />
              </strong>
            </div>
          </div>

          {user?.role === 'user' || user?.role === 'volunteer' ? (
            <button
              className="btn btn-primary btn-lg"
              onClick={() =>
                navigate(`/request-help?service=${service._id}`)
              }
            >
              📩 Request This Service
            </button>
          ) : (
            !user && (
              <Link to="/login" className="btn btn-primary btn-lg">Login to request this service</Link>
            )
          )}
        </div>

        <aside className="detail-side">
          <div className="card provider-mini">
            <h4>About the Provider</h4>
            <div className="provider-head">
              <span className="avatar large">{(providerUser?.name || 'P').charAt(0)}</span>
              <div>
                <strong>{providerUser?.name}</strong>
                <StarRating value={service.provider?.rating || 0} count={service.provider?.numReviews} />
              </div>
            </div>
            <p>{service.provider?.description || 'No description provided.'}</p>
            <div className="card-meta">
              <span>📍 {service.provider?.location}</span>
              <span>✅ {service.provider?.completedServices || 0} services completed</span>
              <span>
                🛡 {service.provider?.verificationStatus === 'Verified' ? 'Verified Provider' : service.provider?.verificationStatus}
              </span>
            </div>
            <Link to="/providers" className="btn btn-outline btn-sm btn-block">All providers</Link>
          </div>
        </aside>
      </div>

      <section className="section-sm">
        <h2 className="section-title">Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <EmptyState icon="⭐" title="No reviews yet" hint="Reviews appear after completed services." />
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

export default ServiceDetail;
