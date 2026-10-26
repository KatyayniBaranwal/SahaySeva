import { Link } from 'react-router-dom';
import Badge from './Badge';
import { format_date } from '../utils/constants';

const statusButton = (myStatus) => {
  if (myStatus === 'Accepted') {
    return <button className="btn btn-sm btn-outline" disabled>✓ Accepted</button>;
  }
  if (myStatus === 'Completed') {
    return <button className="btn btn-sm btn-outline" disabled>✓ Completed</button>;
  }
  if (myStatus === 'Rejected') {
    return <span className="badge badge-rejected">Application Rejected</span>;
  }
  return <button className="btn btn-sm" disabled>✓ Applied</button>;
};

const OpportunityCard = ({ opportunity, onApply, myStatus, userRole }) => {
  const org = opportunity.organization || {};
  const canApply = userRole === 'volunteer' || userRole === 'user';
  const full = opportunity.status !== 'Open';

  return (
    <article className="card">
      <div className="card-badges">
        <span className="badge badge-volunteer">VOLUNTEERING</span>
        <Badge type="cat">{opportunity.category}</Badge>
        {org.verificationStatus === 'Verified' && <Badge type="verified">✓ Verified Org</Badge>}
        {opportunity.certificateEligible && <Badge type="college">📜 Certificate Eligible</Badge>}
      </div>
      <h3 className="card-title">{opportunity.title}</h3>
      <p className="card-desc">{opportunity.description}</p>
      <div className="card-meta">
        <span>🏛 {org.name}</span>
        <span>📍 {opportunity.location}</span>
        <span>📅 {format_date(opportunity.date)}</span>
        <span>
          🕐 {opportunity.startTime}–{opportunity.endTime}
        </span>
        <span>⏱ {opportunity.serviceHours} service hours</span>
        <span>👥 {opportunity.requiredVolunteers} volunteers needed</span>
      </div>
      <div className="card-footer card-footer-actions">
        <Link to={`/volunteer/${opportunity._id}`} className="btn btn-outline btn-sm">
          View Details
        </Link>
        {canApply ? (
          myStatus ? (
            statusButton(myStatus)
          ) : (
            <button className="btn btn-primary btn-sm" onClick={onApply} disabled={full}>
              {full ? 'Closed' : 'Apply to Volunteer'}
            </button>
          )
        ) : (
          !userRole && (
            <Link to="/login" className="btn btn-outline btn-sm">
              Login to Apply
            </Link>
          )
        )}
      </div>
    </article>
  );
};

export default OpportunityCard;
