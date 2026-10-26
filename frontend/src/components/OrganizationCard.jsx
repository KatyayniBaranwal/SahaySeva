import { Link } from 'react-router-dom';
import Badge from './Badge';

const OrganizationCard = ({ organization }) => {
  const org = organization;
  const isSahaySeva = org.organizationType === 'SahaySeva Organization';

  return (
    <article className="card org-card">
      <div className="card-badges">
        {isSahaySeva ? (
          <Badge type="sahayseva">SAHAYSEVA ORGANIZATION</Badge>
        ) : org.organizationType === 'Demo Organization' ? (
          <Badge type="demo">DEMO ORGANIZATION</Badge>
        ) : (
          <Badge type="external">EXTERNAL ORGANIZATION</Badge>
        )}
        {org.verificationStatus === 'Verified' && <Badge type="verified">✓ VERIFIED</Badge>}
        {org.verificationStatus === 'Pending Verification' && <Badge type="pending">PENDING VERIFICATION</Badge>}
      </div>
      <h3 className="card-title">{isSahaySeva ? <Link to={`/organizations/${org._id}`}>{org.name}</Link> : org.name}</h3>
      <p className="card-desc">{org.description}</p>
      <div className="card-meta">
        {org.causes?.length > 0 && <span>🎯 {org.causes.join(', ')}</span>}
        <span>📍 {org.location || '—'}</span>
        {org.contact?.email && <span>✉️ {org.contact.email}</span>}
        {org.contact?.phone && <span>📞 {org.contact.phone}</span>}
      </div>
      <div className="card-footer card-footer-actions">
        {isSahaySeva ? (
          <>
            <span className="badge badge-count">{org.openOpportunities} open opportunities</span>
            <Link to={`/organizations/${org._id}`} className="btn btn-primary btn-sm">
              View Opportunities
            </Link>
          </>
        ) : (
          <>
            {!isSahaySeva && (
              <span className="footer-note">Not a SahaySeva partner — listed as a public resource.</span>
            )}
            {org.officialWebsite && (
              <a
                className="btn btn-outline btn-sm"
                href={org.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit Official Website ↗
              </a>
            )}
          </>
        )}
      </div>
    </article>
  );
};

export default OrganizationCard;
