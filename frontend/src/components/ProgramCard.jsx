import { Link } from 'react-router-dom';
import Badge from './Badge';
import { format_date } from '../utils/constants';

const ProgramCard = ({ program, onJoin, joined, userRole }) => (
  <article className="card">
    <div className="card-badges">
      <span className="badge badge-college">COLLEGE PROGRAM</span>
      <Badge type="cat">{program.category}</Badge>
      {program.institute?.verificationStatus === 'Verified' && <Badge type="verified">✓ Verified Institute</Badge>}
    </div>
    <h3 className="card-title">{program.title}</h3>
    <p className="card-desc">{program.description}</p>
    <div className="card-meta">
      <span>🎓 {program.institute?.name}</span>
      <span>📍 {program.location}</span>
      <span>📅 {format_date(program.date)}</span>
      <span>
        🕘 {program.startTime}–{program.endTime}
      </span>
      <span>⏱ {program.serviceHours} service hours</span>
      <span>👥 {program.requiredStudents} students needed</span>
    </div>
    {onJoin && (
      <div className="card-footer card-footer-actions">
        {userRole === 'volunteer' || userRole === 'user' ? (
          joined ? (
            <button className="btn btn-sm" disabled>
              ✓ Joined
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={onJoin}>
              Join Program
            </button>
          )
        ) : (
          <Link to="/login" className="btn btn-outline btn-sm">
            Login to join
          </Link>
        )}
      </div>
    )}
  </article>
);

export default ProgramCard;
