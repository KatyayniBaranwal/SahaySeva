import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ services: 0, opportunities: 0, organizations: 0, institutes: 0 });

  useEffect(() => {
    Promise.all([
      client.get('/services'),
      client.get('/opportunities?status=Open'),
      client.get('/organizations?type=sahayseva'),
      client.get('/institutes'),
    ])
      .then(([s, o, org, i]) =>
        setStats({ services: s.data.count, opportunities: o.data.count, organizations: org.data.count, institutes: i.data.count })
      )
      .catch(() => {});
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="container hero-inner">
          <span className="hero-eyebrow">Community Support Service Platform</span>
          <h1>SahaySeva</h1>
          <p className="hero-tagline">"Need Help? Have Help to Offer?"</p>
          <p className="hero-sub">
            One platform for free community support, trusted local services, verified volunteering,
            NGOs and college service programs — with service-hour tracking and verifiable
            certificates.
          </p>
          <div className="hero-actions">
            <Link to="/request-help" className="btn btn-primary btn-lg">🙋 Request Help</Link>
            <Link to="/services" className="btn btn-accent btn-lg">🛠 Offer a Service</Link>
            <Link to="/volunteer" className="btn btn-outline-light btn-lg">❤️ Volunteer</Link>
          </div>
          <div className="hero-chips">
            <span className="chip">✓ Free &amp; Paid clearly labelled</span>
            <span className="chip">✓ Verified organizations</span>
            <span className="chip">✓ Service hours &amp; certificates</span>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="demo-banner">
          ⚠️ <strong>Demo Data:</strong> This is a college prototype. All users, NGOs, institutes
          and statistics shown are sample records created for demonstration.
        </div>
      </div>

      <section className="section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="grid grid-4">
            {[
              ['1', '📝', 'Post or Browse', 'Create a help request, list your service, or browse what your community offers.'],
              ['2', '🤝', 'Get Matched', 'A provider, volunteer, NGO or college program accepts and takes it forward.'],
              ['3', '✅', 'Complete & Review', 'Mark the work done and rate the experience after completion.'],
              ['4', '📜', 'Get Verified', 'Structured programs verify service hours and issue verifiable certificates.'],
            ].map(([n, icon, title, text]) => (
              <div className="card step-card" key={n}>
                <div className="step-num">{n}</div>
                <div className="step-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">What can you do on SahaySeva?</h2>
          <div className="grid grid-2">
            <div className="card feature-card">
              <div className="feature-icon">🙏</div>
              <div>
                <h3>Free Community Support</h3>
                <p>
                  Need groceries for an elderly neighbour? A companion for a hospital visit? Post a
                  free help request and a volunteer or community member can accept it.
                  <span className="badge badge-free">FREE</span> requests never generate
                  certificates — they are simply neighbours helping neighbours.
                </p>
                <Link to="/requests" className="btn btn-outline btn-sm">Browse Help Requests</Link>
              </div>
            </div>
            <div className="card feature-card">
              <div className="feature-icon">🛠</div>
              <div>
                <h3>Paid Local Services</h3>
                <p>
                  Need computer repair at home or a maths tutor? Local service providers list their
                  skills with transparent pricing.
                  <span className="badge badge-paid">PAID</span> services show the price upfront,
                  with ratings and reviews after completion.
                </p>
                <Link to="/services" className="btn btn-outline btn-sm">Explore Local Services</Link>
              </div>
            </div>
            <div className="card feature-card">
              <div className="feature-icon">❤️</div>
              <div>
                <h3>Volunteer for Causes</h3>
                <p>
                  Teaching children, food distribution, cleanliness drives, tree plantation — apply
                  to opportunities posted by organizations, track your applications and build a
                  verified service-hours history.
                </p>
                <Link to="/volunteer" className="btn btn-outline btn-sm">Find Opportunities</Link>
              </div>
            </div>
            <div className="card feature-card">
              <div className="feature-icon">🎓</div>
              <div>
                <h3>Colleges &amp; Certificates</h3>
                <p>
                  Institutes run structured community-service programs for students, verify their
                  hours, and issue certificates like <code>SS-2026-0001</code> that anyone can
                  verify online.
                </p>
                <Link to="/colleges" className="btn btn-outline btn-sm">See College Programs</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Built for the whole community ecosystem</h2>
          <div className="grid grid-4">
            {[
              ['🙋', 'Community Users', 'Request help, browse services, track everything in one dashboard.', '/request-help'],
              ['🛠', 'Service Providers', 'List services, accept requests, earn & build reputation.', '/services'],
              ['❤️', 'Volunteers', 'Apply to opportunities, log verified hours, earn certificates.', '/volunteer'],
              ['🏛', 'NGOs & Organizations', 'Post opportunities, manage volunteers, verify hours.', '/organizations'],
              ['🎓', 'Colleges & Institutes', 'Run service programs, manage students, issue certificates.', '/colleges'],
              ['🛡', 'Admin', 'Verify organizations, monitor activity, keep the platform safe.', '/login'],
              ['⭐', 'Ratings & Reviews', 'Only after completion — honest, earned reputation.', '/services'],
              ['📜', 'Certificates', 'Every certificate has a unique ID that anyone can verify.', '/verify-certificate'],
            ].map(([icon, title, text, to]) => (
              <Link to={to} className="card mini-card" key={title}>
                <div className="mini-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container">
          <h2 className="section-title light">Certificates &amp; Service Hours</h2>
          <div className="cert-strip">
            <div>
              <h3>Only for structured, verified service</h3>
              <p>
                Ordinary community help is kind — but it doesn't need a certificate. SahaySeva
                issues certificates only for structured programs run by verified NGOs and
                institutes, where participation and service hours are formally verified.
              </p>
              <ul>
                <li>Unique Certificate ID (e.g. <code>SS-2026-0001</code>)</li>
                <li>Activity, service hours and completion date recorded</li>
                <li>Public verification page with QR-ready URL</li>
              </ul>
              <Link to="/verify-certificate" className="btn btn-accent">Try verifying SS-2026-0001</Link>
            </div>
            <div className="cert-preview">
              <div className="cert-card">
                <span className="cert-label">CERTIFICATE OF COMMUNITY SERVICE</span>
                <strong>Arjun Patel</strong>
                <span>Monsoon Donation Drive · 4 hours</span>
                <span className="cert-id">SS-2026-0001</span>
                <span className="cert-issuer">Issued by Seva Foundation</span>
                <span className="badge badge-verified">✓ VERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Live platform statistics</h2>
          <p className="section-sub">Numbers below come straight from the demo database.</p>
          <div className="grid grid-4 stat-row">
            <div className="stat-card"><div className="stat-icon">🛠</div><div><div className="stat-value">{stats.services}</div><div className="stat-label">Local Services</div></div></div>
            <div className="stat-card"><div className="stat-icon">❤️</div><div><div className="stat-value">{stats.opportunities}</div><div className="stat-label">Open Volunteer Opportunities</div></div></div>
            <div className="stat-card"><div className="stat-icon">🏛</div><div><div className="stat-value">{stats.organizations}</div><div className="stat-label">SahaySeva Organizations</div></div></div>
            <div className="stat-card"><div className="stat-icon">🎓</div><div><div className="stat-value">{stats.institutes}</div><div className="stat-label">Registered Institutes</div></div></div>
          </div>
        </div>
      </section>

      <section className="section cta-band">
        <div className="container cta-inner">
          <div>
            <h2>Ready to get started?</h2>
            <p>Join as a community member, service provider, volunteer, NGO or college.</p>
          </div>
          <div className="hero-actions">
            {user ? (
              <Link to="/dashboard" className="btn btn-accent btn-lg">Go to My Dashboard</Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-accent btn-lg">Create Free Account</Link>
                <Link to="/login" className="btn btn-outline-light btn-lg">Login</Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
