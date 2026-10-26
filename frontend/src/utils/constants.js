export const CATEGORIES = [
  'Elderly Assistance',
  'Education',
  'Healthcare Assistance',
  'Food Assistance',
  'Transportation',
  'Household Help',
  'Digital Assistance',
  'Emergency Support',
  'Community Events',
  'Environment',
  'Other',
];

export const URGENCIES = ['Low', 'Medium', 'High', 'Emergency'];

export const ROLE_LABELS = {
  user: 'Community User',
  provider: 'Service Provider',
  volunteer: 'Volunteer',
  ngo: 'NGO / Organization',
  college: 'College / Institute',
  admin: 'Admin',
};

export const ROLE_DASHBOARD_HINTS = {
  user: 'Request help and track it here.',
  provider: 'Manage your services and incoming requests.',
  volunteer: 'Find opportunities and track your service hours.',
  ngo: 'Post opportunities and manage volunteers.',
  college: 'Run community-service programs for students.',
  admin: 'Monitor and manage the platform.',
};

export const statusClass = (status) =>
  `badge badge-${String(status).toLowerCase().replace(/\s+/g, '-')}`;

export const format_date = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const rupees = (amount) => (amount ? `₹${Number(amount).toLocaleString('en-IN')}` : '—');
