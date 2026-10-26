import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../utils/constants';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  const close = () => setOpen(false);

  const links = (
    <>
      <NavLink to="/services" onClick={close}>Services</NavLink>
      <NavLink to="/requests" onClick={close}>Help Requests</NavLink>
      <NavLink to="/volunteer" onClick={close}>Volunteer</NavLink>
      <NavLink to="/organizations" onClick={close}>Organizations</NavLink>
      <NavLink to="/colleges" onClick={close}>Colleges</NavLink>
      <NavLink to="/verify-certificate" onClick={close}>Verify Certificate</NavLink>
    </>
  );

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-logo">🤝</span>
          <span>
            Sahay<em>Seva</em>
          </span>
        </Link>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {links}
          {user ? (
            <div className="nav-user">
              <Link to="/dashboard" className="btn btn-primary btn-sm" onClick={close}>
                Dashboard
              </Link>
              <span className="nav-role" title={ROLE_LABELS[user.role]}>
                {user.name}
              </span>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="nav-user">
              <Link to="/login" className="btn btn-outline btn-sm" onClick={close}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={close}>
                Register
              </Link>
            </div>
          )}
        </nav>

        <button
          className="nav-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
