import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RequireAuth from './components/RequireAuth';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Providers from './pages/Providers';
import BrowseRequests from './pages/BrowseRequests';
import RequestHelp from './pages/RequestHelp';
import Opportunities from './pages/Opportunities';
import OpportunityDetail from './pages/OpportunityDetail';
import Organizations from './pages/Organizations';
import OrganizationDetail from './pages/OrganizationDetail';
import Colleges from './pages/Colleges';
import CollegeDetail from './pages/CollegeDetail';
import CertificateVerify from './pages/CertificateVerify';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

const App = () => (
  <div className="app-shell">
    <Navbar />
    <main className="app-main">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/providers" element={<Providers />} />
        <Route path="/requests" element={<BrowseRequests />} />
        <Route
          path="/request-help"
          element={
            <RequireAuth>
              <RequestHelp />
            </RequireAuth>
          }
        />
        <Route path="/volunteer" element={<Opportunities />} />
        <Route path="/volunteer/:id" element={<OpportunityDetail />} />
        <Route path="/organizations" element={<Organizations />} />
        <Route path="/organizations/:id" element={<OrganizationDetail />} />
        <Route path="/colleges" element={<Colleges />} />
        <Route path="/colleges/:id" element={<CollegeDetail />} />
        <Route path="/verify-certificate" element={<CertificateVerify />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
    <Footer />
  </div>
);

export default App;
