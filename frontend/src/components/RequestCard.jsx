import { Link } from 'react-router-dom';
import Badge from './Badge';
import { format_date, rupees, URGENCIES } from '../utils/constants';

const urgencyRank = (u) => URGENCIES.indexOf(u);

const RequestCard = ({ request, actions, showRequester = true }) => (
  <article className={`card request-card urgency-${urgencyRank(request.urgency)}`}>
    <div className="card-badges">
      <span className={`badge ${request.pricingType === 'Free' ? 'badge-free' : 'badge-paid'}`}>
        {request.pricingType === 'Free'
          ? 'FREE HELP NEEDED'
          : `PAID · up to ${rupees(request.budget)}`}
      </span>
      <Badge type={`urgency-${request.urgency.toLowerCase()}`}>{request.urgency}</Badge>
      <Badge type={request.status.toLowerCase().replace(/\s+/g, '-')}>{request.status}</Badge>
    </div>
    <h3 className="card-title">{request.title}</h3>
    <p className="card-desc">{request.description}</p>
    <div className="card-meta">
      {showRequester && <span>👤 {request.requester?.name || 'User'}</span>}
      <span>🏷 {request.category}</span>
      <span>📍 {request.location}</span>
      {request.preferredDate && <span>📅 {format_date(request.preferredDate)} {request.preferredTime}</span>}
      {request.assignedProvider && (
        <span>
          🙋 Helper: <Link to={`/providers`}>{request.assignedProvider.name}</Link>
        </span>
      )}
    </div>
    {actions && <div className="card-footer card-footer-actions">{actions}</div>}
  </article>
);

export default RequestCard;
