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
    if (!r.data.token) throw new Error('login failed for ' + email);
    return r.data.token;
  };

  const arjun = await login('arjun@sahayseva.com', 'Password@123');
  const kavya = await login('kavya@sahayseva.com', 'Password@123');
  const hope = await login('hope@sahayseva.com', 'Password@123');
  const green = await login('green@sahayseva.com', 'Password@123');
  const ravi = await login('ravi@sahayseva.com', 'Password@123');
  const seva = await login('seva@sahayseva.com', 'Password@123');

  const opps = await api('GET', '/opportunities?status=Open');
  const teaching = opps.data.opportunities.find((o) => o.title === 'Weekend Teaching for Children');
  const lake = opps.data.opportunities.find((o) => o.title === 'Lake Cleanliness Drive');
  check('demo opportunities include certificateEligible flag', teaching.certificateEligible === true && lake.certificateEligible === false);
  check('teaching opportunity has requirements text', typeof teaching.requirements === 'string' && teaching.requirements.length > 0);

  const detail = await api('GET', `/opportunities/${teaching._id}`);
  check('opportunity detail returns acceptedCount', detail.status === 200 && typeof detail.data.acceptedCount === 'number');

  const noAuthApply = await api('POST', `/applications/${teaching._id}/apply`);
  check('logged-out apply blocked (401)', noAuthApply.status === 401);

  const ngoApply = await api('POST', `/applications/${teaching._id}/apply`, { token: seva, body: {} });
  check('NGO cannot apply (403)', ngoApply.status === 403);

  const apply = await api('POST', `/applications/${teaching._id}/apply`, { token: arjun });
  check('volunteer applies', apply.status === 201 && apply.data.application.status === 'Applied');

  const dupApply = await api('POST', `/applications/${teaching._id}/apply`, { token: arjun });
  check('duplicate apply rejected with message', dupApply.status === 400 && dupApply.data.message === 'You have already applied for this opportunity.');

  const myApps = await api('GET', '/applications/mine', { token: arjun });
  const mine = myApps.data.applications.find((a) => a.opportunity?._id === teaching._id);
  check('application appears in volunteer dashboard data', Boolean(mine) && mine.opportunity.title === 'Weekend Teaching for Children');
  check('application links volunteer to organization', Boolean(mine.opportunity.organization?.name === 'Hope Literacy Mission'));

  const wrongOrgAccept = await api('PUT', `/applications/${mine._id}`, { token: green, body: { status: 'Accepted' } });
  check('other organization cannot accept (403)', wrongOrgAccept.status === 403);

  const volAccept = await api('PUT', `/applications/${mine._id}`, { token: arjun, body: { status: 'Accepted' } });
  check('volunteer cannot self-accept (403)', volAccept.status === 403);

  const accept = await api('PUT', `/applications/${mine._id}`, { token: hope, body: { status: 'Accepted' } });
  check('organization accepts applicant', accept.status === 200 && accept.data.application.status === 'Accepted' && Boolean(accept.data.application.acceptedAt));

  const earlyCert = await api('POST', '/certificates/generate/application', { token: hope, body: { applicationId: mine._id } });
  check('no certificate before completion', earlyCert.status === 400);

  const volComplete = await api('PUT', `/applications/${mine._id}`, { token: arjun, body: { status: 'Completed' } });
  check('volunteer cannot self-verify participation (403)', volComplete.status === 403);

  const complete = await api('PUT', `/applications/${mine._id}`, { token: hope, body: { status: 'Completed' } });
  check('organization verifies participation', complete.status === 200 && complete.data.application.status === 'Completed' && Boolean(complete.data.application.completedAt));

  const parts = await api('GET', '/participations/mine', { token: arjun });
  const part = parts.data.participations.find((p) => p.opportunity?._id === teaching._id);
  check('participation record created with 3 service hours', Boolean(part) && part.serviceHours === 3 && part.verificationStatus === 'Verified' && part.completionStatus === 'Completed');
  check('verifier recorded', Boolean(part?.verifiedBy));

  const hours = await api('GET', '/stats/dashboard', { token: arjun });
  check('service hours awarded once (4 seeded + 3 new = 7)', hours.data.stats.totalHours === 7, `got ${hours.data.stats.totalHours}`);

  const dupComplete = await api('PUT', `/applications/${mine._id}`, { token: hope, body: { status: 'Completed' } });
  check('re-verification blocked', dupComplete.status === 400);

  const cert = await api('POST', '/certificates/generate/application', { token: hope, body: { applicationId: mine._id } });
  check('certificate generated for eligible activity', cert.status === 201 && /^SS-\d{4}-\d{4}$/.test(cert.data.certificate.certificateId));

  const dupCert = await api('POST', '/certificates/generate/application', { token: hope, body: { applicationId: mine._id } });
  check('duplicate certificate blocked', dupCert.status === 400);

  const verifyCert = await api('GET', `/certificates/verify/${cert.data.certificate.certificateId}`);
  check('certificate publicly verifiable', verifyCert.status === 200 && verifyCert.data.certificate.recipientName === 'Arjun Patel' && verifyCert.data.certificate.issuer === 'Hope Literacy Mission');

  console.log('\n--- Help Request acceptance flow (volunteer dashboard) ---');
  const openReqs = await api('GET', '/requests?scope=open', { token: arjun });
  const reqA = openReqs.data.requests.find((r) => r.title.startsWith('Groceries and medicines'));
  const reqB = openReqs.data.requests.find((r) => r.title.startsWith('Escort needed for hospital'));

  const volStatsBefore = await api('GET', '/stats/dashboard', { token: arjun });
  check('pre-condition: arjun acceptedHelpRequests = 0', volStatsBefore.data.stats.acceptedHelpRequests === 0, `got ${volStatsBefore.data.stats.acceptedHelpRequests}`);

  const acceptReq = await api('PUT', `/requests/${reqA._id}/status`, { token: arjun, body: { status: 'Accepted' } });
  check('volunteer accepts help request (status + acceptedAt persisted)', acceptReq.status === 200 && acceptReq.data.request.status === 'Accepted' && Boolean(acceptReq.data.request.acceptedAt));

  const dupAccept = await api('PUT', `/requests/${reqA._id}/status`, { token: arjun, body: { status: 'Accepted' } });
  check('duplicate self-accept blocked with exact message', dupAccept.status === 400 && dupAccept.data.message === 'You have already accepted this request.');

  const steal = await api('PUT', `/requests/${reqA._id}/status`, { token: kavya, body: { status: 'Accepted' } });
  check('another volunteer cannot take the same request', steal.status === 400 && steal.data.message === 'This request has already been taken by another volunteer.');

  const kavyaStats = await api('GET', '/stats/dashboard', { token: kavya });
  check('kavya (other volunteer) still has 0 — count is per-user', kavyaStats.data.stats.acceptedHelpRequests === 0, `got ${kavyaStats.data.stats.acceptedHelpRequests}`);

  const arjunStats1 = await api('GET', '/stats/dashboard', { token: arjun });
  check('arjun dashboard Accepted = 1 (read from DB)', arjunStats1.data.stats.acceptedHelpRequests === 1, `got ${arjunStats1.data.stats.acceptedHelpRequests}`);

  const assigned = await api('GET', '/requests?scope=assigned', { token: arjun });
  const mine1 = assigned.data.requests.find((r) => r._id === reqA._id);
  check('accepted request details available (requester, acceptedAt, urgency, pricing)', Boolean(mine1) && mine1.requester?.name === 'Ravi Sharma' && Boolean(mine1.acceptedAt) && mine1.urgency === 'Medium' && mine1.pricingType === 'Free');

  const acceptB = await api('PUT', `/requests/${reqB._id}/status`, { token: arjun, body: { status: 'Accepted' } });
  check('volunteer accepts second request', acceptB.status === 200);
  const arjunStats2 = await api('GET', '/stats/dashboard', { token: arjun });
  check('arjun dashboard Accepted = 2', arjunStats2.data.stats.acceptedHelpRequests === 2, `got ${arjunStats2.data.stats.acceptedHelpRequests}`);

  const progress = await api('PUT', `/requests/${reqB._id}/status`, { token: arjun, body: { status: 'In Progress' } });
  const done = await api('PUT', `/requests/${reqB._id}/status`, { token: arjun, body: { status: 'Completed' } });
  check('lifecycle Accepted → In Progress → Completed works', progress.status === 200 && done.status === 200 && done.data.request.status === 'Completed');
  const arjunStats3 = await api('GET', '/stats/dashboard', { token: arjun });
  check('count stays 2 after completion (no double counting)', arjunStats3.data.stats.acceptedHelpRequests === 2, `got ${arjunStats3.data.stats.acceptedHelpRequests}`);

  const raviMine = await api('GET', '/requests?scope=mine', { token: ravi });
  const raviView = raviMine.data.requests.find((r) => r._id === reqA._id);
  check('requester sees Accepted status + helper name (one source of truth)', raviView.status === 'Accepted' && raviView.assignedProvider?.name === 'Arjun Patel');

  const rejectFlow = await api('POST', `/applications/${lake._id}/apply`, { token: kavya });
  check('apply to non-eligible activity works', rejectFlow.status === 201);
  const kavyaApps = await api('GET', '/applications/mine', { token: kavya });
  const kavyaLake = kavyaApps.data.applications.find((a) => a.opportunity?._id === lake._id);
  const reject = await api('PUT', `/applications/${kavyaLake._id}`, { token: green, body: { status: 'Rejected' } });
  check('organization can reject applicant', reject.status === 200 && reject.data.application.status === 'Rejected' && Boolean(reject.data.application.rejectedAt));

  const capOpp = await api('POST', '/opportunities', {
    token: hope,
    body: {
      title: 'Capacity Test Activity',
      description: 'Temporary test opportunity.',
      category: 'Other',
      location: 'Pune',
      date: '2026-10-30',
      startTime: '09:00',
      endTime: '12:00',
      serviceHours: 2,
      requiredVolunteers: 1,
    },
  });
  const capOppId = capOpp.data.opportunity._id;
  const arjunCapApply = await api('POST', `/applications/${capOppId}/apply`, { token: arjun });
  await api('POST', `/applications/${capOppId}/apply`, { token: kavya });
  const acceptA = await api('PUT', `/applications/${arjunCapApply.data.application._id}`, { token: hope, body: { status: 'Accepted' } });
  const kavyaCap = (await api('GET', '/applications/mine', { token: kavya })).data.applications.find((a) => a.opportunity?._id === capOppId);
  const acceptK = await api('PUT', `/applications/${kavyaCap._id}`, { token: hope, body: { status: 'Accepted' } });
  check('capacity 1: first accept ok, second accept blocked (slots full)', acceptA.status === 200 && acceptK.status === 400 && acceptK.data.message === 'Volunteer slots are full.', JSON.stringify(acceptK.data));

  const delOpp = await api('DELETE', `/opportunities/${capOppId}`, { token: hope });
  check('cleanup: test opportunity removed', delOpp.status === 200);

  console.log(failures === 0 ? '\nALL VOLUNTEER WORKFLOW TESTS PASSED' : `\n${failures} TEST(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
};

run().catch((e) => {
  console.error('TEST CRASH:', e);
  process.exit(1);
});
