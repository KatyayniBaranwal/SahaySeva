const BASE = 'http://localhost:5000/api';
let failures = 0;

const check = (name, cond, extra = '') => {
  if (cond) console.log(`PASS  ${name}`);
  else {
    failures += 1;
    console.log(`FAIL  ${name} ${extra}`);
  }
};

const api = async (method, path, { token, body } = {}) => {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
};

const run = async () => {
  const login = async (email, password) => {
    const r = await api('POST', '/auth/login', { body: { email, password } });
    check(`login ${email}`, r.status === 200 && r.data.token);
    return r.data.token;
  };

  const admin = await login('admin@sahayseva.com', 'Admin@123');
  const ravi = await login('ravi@sahayseva.com', 'Password@123');
  const priya = await login('priya@sahayseva.com', 'Password@123');
  const anita = await login('anita@sahayseva.com', 'Password@123');
  const arjun = await login('arjun@sahayseva.com', 'Password@123');
  const farhan = await login('farhan@sahayseva.com', 'Password@123');
  const seva = await login('seva@sahayseva.com', 'Password@123');
  const college = await login('college@sahayseva.com', 'Password@123');
  const sneha = await login('sneha@sahayseva.com', 'Student@123');

  const badLogin = await api('POST', '/auth/login', { body: { email: 'ravi@sahayseva.com', password: 'wrong' } });
  check('wrong password rejected 401', badLogin.status === 401);

  const noAuth = await api('GET', '/requests');
  check('protected route blocked without token', noAuth.status === 401);

  const userDash = await api('GET', '/stats/dashboard', { token: ravi });
  check('user dashboard stats', userDash.status === 200 && userDash.data.stats.totalRequests === 2);

  const adminDash = await api('GET', '/stats/dashboard', { token: admin });
  check('admin stats totals', adminDash.data.stats.totalUsers > 10 && adminDash.data.stats.certificates === 3);

  const created = await api('POST', '/requests', {
    token: ravi,
    body: {
      title: 'Smoke test request',
      description: 'Need help with smoke test flow.',
      category: 'Other',
      location: 'Pune',
      urgency: 'Low',
      pricingType: 'Free',
    },
  });
  check('create help request', created.status === 201, JSON.stringify(created.data));
  const requestId = created.data.request?._id;

  const accepted = await api('PUT', `/requests/${requestId}/status`, { token: anita, body: { status: 'Accepted' } });
  check('provider accepts request', accepted.status === 200 && accepted.data.request.status === 'Accepted');

  const dupAccept = await api('PUT', `/requests/${requestId}/status`, { token: arjun, body: { status: 'Accepted' } });
  check('second accept blocked', dupAccept.status === 400);

  await api('PUT', `/requests/${requestId}/status`, { token: anita, body: { status: 'In Progress' } });
  const done = await api('PUT', `/requests/${requestId}/status`, { token: anita, body: { status: 'Completed' } });
  check('request completed', done.status === 200 && done.data.request.status === 'Completed');

  const earlyReview = await api('POST', '/reviews', {
    token: ravi,
    body: { targetId: 'x', requestId: 'x', rating: 5 },
  });
  check('bad review rejected', earlyReview.status >= 400);

  const review = await api('POST', '/reviews', {
    token: ravi,
    body: { targetId: accepted.data.request.assignedProvider._id, requestId, rating: 4, comment: 'Good job' },
  });
  check('review after completion', review.status === 201, JSON.stringify(review.data));

  const dupReview = await api('POST', '/reviews', {
    token: ravi,
    body: { targetId: accepted.data.request.assignedProvider._id, requestId, rating: 5 },
  });
  check('duplicate review blocked', dupReview.status === 400);

  const openOpps = await api('GET', '/opportunities?status=Open');
  check('public opportunities list', openOpps.status === 200 && openOpps.data.count >= 4);

  const target = openOpps.data.opportunities.find((o) => o.title === 'Lake Cleanliness Drive');
  const apply = await api('POST', `/applications/${target._id}/apply`, { token: arjun });
  check('volunteer applies', apply.status === 201, JSON.stringify(apply.data));
  const dupApply = await api('POST', `/applications/${target._id}/apply`, { token: arjun });
  check('duplicate apply blocked', dupApply.status === 400);

  const orgApps = await api('GET', '/applications', { token: seva });
  check('ngo sees applications', orgApps.status === 200 && orgApps.data.count >= 3, JSON.stringify(orgApps.data).slice(0, 200));

  const ngoOpps = await api('GET', '/opportunities?mine=1', { token: seva });
  const monsoon = ngoOpps.data.opportunities.find((o) => o.title === 'Monsoon Donation Drive');
  check('ngo lists own opportunities', Boolean(monsoon));

  const completedApps = orgApps.data.applications.filter((a) => a.status === 'Completed');
  const cert = await api('POST', '/certificates/generate/application', {
    token: seva,
    body: { applicationId: completedApps[0]._id },
  });
  check('ngo generates certificate', cert.status === 201 && /^SS-\d{4}-\d{4}$/.test(cert.data.certificate?.certificateId || ''), JSON.stringify(cert.data));

  const dupCert = await api('POST', '/certificates/generate/application', {
    token: seva,
    body: { applicationId: completedApps[0]._id },
  });
  check('duplicate certificate blocked', dupCert.status === 400);

  const verify = await api('GET', `/certificates/verify/SS-2026-0001`);
  check('verify certificate by ID', verify.status === 200 && verify.data.valid === true && verify.data.certificate.recipientName === 'Arjun Patel');

  const badVerify = await api('GET', '/certificates/verify/SS-9999-9999');
  check('invalid certificate returns 404', badVerify.status === 404 && badVerify.data.valid === false);

  const orgsSahay = await api('GET', '/organizations?type=sahayseva');
  check('sahayseva org filter', orgsSahay.data.organizations.every((o) => o.organizationType === 'SahaySeva Organization'));

  const verifyOrg = await api('POST', `/organizations/${orgsSahay.data.organizations.find((o) => o.verificationStatus !== 'Verified')._id}/verify`, {
    token: admin,
    body: { verificationStatus: 'Verified' },
  });
  check('admin verifies organization', verifyOrg.status === 200 && verifyOrg.data.organization.verificationStatus === 'Verified');

  const forbiddenVerify = await api('POST', `/organizations/${orgsSahay.data.organizations[0]._id}/verify`, {
    token: ravi,
    body: { verificationStatus: 'Verified' },
  });
  check('non-admin cannot verify org', forbiddenVerify.status === 403);

  const programs = await api('GET', '/programs?status=Open');
  check('public programs list', programs.status === 200 && programs.data.count >= 2);
  const teaching = programs.data.programs.find((p) => p.title === 'Community Teaching Drive');

  const newStudent = await api('POST', '/auth/register', {
    body: { name: 'Test Student', email: 'test.student@sahayseva.com', password: 'Password@123', role: 'volunteer', location: 'Pune' },
  });
  check('self registration works', newStudent.status === 201 && newStudent.data.token);
  const testToken = newStudent.data.token;

  const join = await api('POST', `/programs/${teaching._id}/join`, { token: testToken });
  check('student joins program', join.status === 201);

  const myParts = await api('GET', '/participations/mine', { token: sneha });
  check('student sees participation history', myParts.status === 200 && myParts.data.count >= 1);

  const completedParts = myParts.data.participations.filter((p) => p.completionStatus === 'Completed');
  const collegeCerts = await api('GET', '/certificates', { token: college });
  check('college lists issued certificates', collegeCerts.status === 200 && collegeCerts.data.count >= 1);

  const mineCerts = await api('GET', '/certificates/mine', { token: sneha });
  check('recipient sees own certificates', mineCerts.data.count >= 1);

  const students = await api('GET', `/institutes/${programs.data.programs[0].institute._id}/students`, { token: college });
  check('college lists affiliated students', students.status === 200 && students.data.count >= 4);

  const addStudent = await api('POST', `/institutes/${programs.data.programs[0].institute._id}/students`, {
    token: college,
    body: { name: 'New Enrolled Student', email: 'new.student@sahayseva.com' },
  });
  check('college adds student', addStudent.status === 201, JSON.stringify(addStudent.data));

  const servicesSearch = await api('GET', '/services?q=tuition');
  check('service search', servicesSearch.status === 200 && servicesSearch.data.count >= 1);

  const save = await api('PUT', `/services/${servicesSearch.data.services[0]._id}/save`, { token: ravi });
  check('save service toggle', save.status === 200 && save.data.saved === true);
  const savedList = await api('GET', '/services/saved', { token: ravi });
  check('saved services list', savedList.status === 200 && savedList.data.count === 1, JSON.stringify(savedList.data).slice(0, 150));

  const volStats = await api('GET', '/stats/dashboard', { token: arjun });
  check('volunteer stats hours', volStats.data.stats.totalHours === 4);

  const ngoStats = await api('GET', '/stats/dashboard', { token: seva });
  check('ngo stats certificates', ngoStats.data.stats.certificatesIssued >= 2);

  const providerProfile = await api('GET', '/providers/me/profile', { token: anita });
  check('provider profile', providerProfile.status === 200 && providerProfile.data.provider.rating >= 4);

  const updateProfile = await api('PUT', '/providers/me/profile', {
    token: farhan,
    body: { availability: 'Mon-Sun, 8 AM to 8 PM' },
  });
  check('provider updates profile', updateProfile.status === 200 && updateProfile.data.provider.availability.includes('Sun'));

  const crossRole = await api('POST', '/services', {
    token: ravi,
    body: { title: 'X', description: 'x', category: 'Other', location: 'Pune', pricingType: 'Free' },
  });
  check('non-provider cannot create service', crossRole.status === 403);

  console.log(failures === 0 ? '\nALL SMOKE TESTS PASSED' : `\n${failures} TEST(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
};

run().catch((e) => {
  console.error('SMOKE CRASH:', e);
  process.exit(1);
});
