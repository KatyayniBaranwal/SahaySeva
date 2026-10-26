const StatCard = ({ icon, label, value, tone }) => (
  <div className={`stat-card ${tone ? `stat-${tone}` : ''}`}>
    <div className="stat-icon">{icon}</div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

export default StatCard;
