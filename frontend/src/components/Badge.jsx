const Badge = ({ type, children }) => (
  <span className={`badge badge-${type}`}>{children}</span>
);

export default Badge;
