import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="footer">
    <div className="container footer-inner">
      <div>
        <div className="brand">
          <span className="brand-logo">🤝</span>
          <span>
            Sahay<em>Seva</em>
          </span>
        </div>
        <p className="footer-tag">
          Community Support Service Platform — connecting people who need help with people who
          can help.
        </p>
        <p className="footer-demo">
          ⚠️ College prototype: all profiles, requests and statistics on this site are Demo Data.
        </p>
      </div>
      <div className="footer-col">
        <h5>Explore</h5>
        <Link to="/services">Local Services</Link>
        <Link to="/requests">Community Help</Link>
        <Link to="/volunteer">Volunteer Opportunities</Link>
        <Link to="/organizations">Organizations</Link>
        <Link to="/colleges">Colleges &amp; Institutes</Link>
      </div>
      <div className="footer-col">
        <h5>Platform</h5>
        <Link to="/verify-certificate">Verify a Certificate</Link>
        <Link to="/register">Create Account</Link>
        <Link to="/login">Login</Link>
      </div>
    </div>
    <div className="footer-bottom">
      <div className="container">SahaySeva © {new Date().getFullYear()} · Built as a college full-stack project (MERN)</div>
    </div>
  </footer>
);

export default Footer;
