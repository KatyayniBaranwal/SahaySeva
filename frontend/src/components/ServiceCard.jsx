import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { rupees } from '../utils/constants';

const ServiceCard = ({ service, saved, onSaveToggle, showProvider = true }) => {
  const providerName = service.provider?.user?.name || 'Provider';
  return (
    <article className="card service-card">
      <div className="card-badges">
        <span className={`badge ${service.pricingType === 'Free' ? 'badge-free' : 'badge-paid'}`}>
          {service.pricingType === 'Free' ? 'FREE SERVICE' : `PAID · ${rupees(service.price)}`}
        </span>
        <span className="badge badge-cat">{service.category}</span>
      </div>
      <h3 className="card-title">
        <Link to={`/services/${service._id}`}>{service.title}</Link>
      </h3>
      <p className="card-desc">{service.description}</p>
      <div className="card-meta">
        {showProvider && <span>👤 {providerName}</span>}
        <span>📍 {service.location}</span>
        {service.availability && <span>🕘 {service.availability}</span>}
      </div>
      <div className="card-footer">
        <StarRating value={service.provider?.rating || 0} count={service.provider?.numReviews} />
        <div className="card-actions">
          {onSaveToggle && (
            <button
              className={`btn-icon ${saved ? 'active' : ''}`}
              onClick={onSaveToggle}
              title={saved ? 'Remove from saved' : 'Save service'}
            >
              {saved ? '❤️' : '🤍'}
            </button>
          )}
          <Link to={`/services/${service._id}`} className="btn btn-outline btn-sm">
            View
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ServiceCard;
