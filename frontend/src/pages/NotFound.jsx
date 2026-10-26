import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="container page center-page">
    <h1 className="oops">404</h1>
    <h2>Page not found</h2>
    <p className="muted">The page you are looking for doesn't exist on SahaySeva.</p>
    <Link to="/" className="btn btn-primary">← Back to Home</Link>
  </div>
);

export default NotFound;
