const EmptyState = ({ icon = '📭', title, hint }) => (
  <div className="empty">
    <div className="empty-icon">{icon}</div>
    <h4>{title}</h4>
    {hint && <p>{hint}</p>}
  </div>
);

export default EmptyState;
