import { useAuth } from '../context/AuthContext';
import UserDashboard from './dashboards/UserDashboard';
import ProviderDashboard from './dashboards/ProviderDashboard';
import VolunteerDashboard from './dashboards/VolunteerDashboard';
import NgoDashboard from './dashboards/NgoDashboard';
import CollegeDashboard from './dashboards/CollegeDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  switch (user.role) {
    case 'provider':
      return <ProviderDashboard />;
    case 'volunteer':
      return <VolunteerDashboard />;
    case 'ngo':
      return <NgoDashboard />;
    case 'college':
      return <CollegeDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <UserDashboard />;
  }
};

export default Dashboard;
