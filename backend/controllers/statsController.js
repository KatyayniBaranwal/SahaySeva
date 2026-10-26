const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');
const Service = require('../models/Service');
const HelpRequest = require('../models/HelpRequest');
const Organization = require('../models/Organization');
const VolunteerOpportunity = require('../models/VolunteerOpportunity');
const VolunteerApplication = require('../models/VolunteerApplication');
const Institute = require('../models/Institute');
const Program = require('../models/Program');
const Participation = require('../models/Participation');
const Certificate = require('../models/Certificate');
const { asyncHandler } = require('../utils/helpers');

const sumHours = async (filter) => {
  const agg = await Participation.aggregate([
    { $match: { ...filter, verificationStatus: 'Verified', completionStatus: 'Completed' } },
    { $group: { _id: null, total: { $sum: '$serviceHours' } } },
  ]);
  return agg.length ? agg[0].total : 0;
};

const dashboard = asyncHandler(async (req, res) => {
  const role = req.user.role;
  const me = req.user._id;

  if (role === 'user') {
    const [totalRequests, pending, accepted, inProgress, completed, saved, reviewsGiven] =
      await Promise.all([
        HelpRequest.countDocuments({ requester: me }),
        HelpRequest.countDocuments({ requester: me, status: 'Pending' }),
        HelpRequest.countDocuments({ requester: me, status: 'Accepted' }),
        HelpRequest.countDocuments({ requester: me, status: 'In Progress' }),
        HelpRequest.countDocuments({ requester: me, status: 'Completed' }),
        User.findById(me).then((u) => (u.savedServices || []).length),
        HelpRequest.countDocuments({ requester: me, status: 'Completed' }),
      ]);
    return res.json({
      role,
      stats: { totalRequests, pending, accepted, inProgress, completed, saved, reviewsGiven },
    });
  }

  if (role === 'provider') {
    const provider = await ServiceProvider.findOne({ user: me });
    const [myServices, openRequests, activeJobs, completedJobs, reviews] = await Promise.all([
      provider ? Service.countDocuments({ provider: provider._id }) : 0,
      HelpRequest.countDocuments({ status: 'Pending', assignedProvider: null }),
      HelpRequest.countDocuments({ assignedProvider: me, status: { $in: ['Accepted', 'In Progress'] } }),
      HelpRequest.countDocuments({ assignedProvider: me, status: 'Completed' }),
      provider ? provider.numReviews : 0,
    ]);
    const earningsAgg = await HelpRequest.aggregate([
      { $match: { assignedProvider: me, status: 'Completed', pricingType: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$budget' } } },
    ]);
    return res.json({
      role,
      stats: {
        myServices,
        openRequests,
        activeJobs,
        completedJobs,
        earnings: earningsAgg.length ? earningsAgg[0].total : 0,
        rating: provider ? provider.rating : 0,
        reviews,
        completedServices: provider ? provider.completedServices : 0,
      },
    });
  }

  if (role === 'volunteer') {
    const [applied, acceptedApps, completedApps, enrolled, completedParts, hours, certificates, acceptedHelpRequests] =
      await Promise.all([
        VolunteerApplication.countDocuments({ volunteer: me, status: 'Applied' }),
        VolunteerApplication.countDocuments({ volunteer: me, status: 'Accepted' }),
        VolunteerApplication.countDocuments({ volunteer: me, status: 'Completed' }),
        Participation.countDocuments({ participant: me, completionStatus: 'Enrolled' }),
        Participation.countDocuments({ participant: me, completionStatus: 'Completed' }),
        sumHours({ participant: me }),
        Certificate.countDocuments({ recipient: me }),
        HelpRequest.countDocuments({
          assignedProvider: me,
          status: { $in: ['Accepted', 'In Progress', 'Completed'] },
        }),
      ]);
    return res.json({
      role,
      stats: {
        applied,
        acceptedApps,
        completedApps,
        enrolled,
        completedParts,
        totalHours: hours,
        certificates,
        acceptedHelpRequests,
      },
    });
  }

  if (role === 'ngo') {
    const org = await Organization.findOne({ owner: me });
    if (!org) return res.json({ role, stats: {} });
    const opportunities = await VolunteerOpportunity.find({ organization: org._id }).select('_id status requiredVolunteers');
    const oppIds = opportunities.map((o) => o._id);
    const [openOpps, pendingApps, acceptedVolunteers, completedPrograms, hours, certs] =
      await Promise.all([
        VolunteerOpportunity.countDocuments({ organization: org._id, status: 'Open' }),
        VolunteerApplication.countDocuments({ opportunity: { $in: oppIds }, status: 'Applied' }),
        VolunteerApplication.countDocuments({ opportunity: { $in: oppIds }, status: { $in: ['Accepted', 'Completed'] } }),
        VolunteerApplication.countDocuments({ opportunity: { $in: oppIds }, status: 'Completed' }),
        sumHours({ organization: org._id }),
        Certificate.countDocuments({ issuedByOrganization: org._id }),
      ]);
    return res.json({
      role,
      stats: {
        organizationName: org.name,
        verificationStatus: org.verificationStatus,
        totalOpportunities: opportunities.length,
        openOpportunities: openOpps,
        pendingApplications: pendingApps,
        acceptedVolunteers,
        completedPrograms,
        verifiedHours: hours,
        certificatesIssued: certs,
      },
    });
  }

  if (role === 'college') {
    const inst = await Institute.findOne({ owner: me });
    if (!inst) return res.json({ role, stats: {} });
    const programs = await Program.find({ institute: inst._id }).select('_id');
    const programIds = programs.map((p) => p._id);
    const [students, openPrograms, enrolled, completedParts, hours, certs] = await Promise.all([
      User.countDocuments({ affiliatedInstitute: inst._id }),
      Program.countDocuments({ institute: inst._id, status: 'Open' }),
      Participation.countDocuments({ program: { $in: programIds }, completionStatus: 'Enrolled' }),
      Participation.countDocuments({ program: { $in: programIds }, completionStatus: 'Completed' }),
      sumHours({ institute: inst._id }),
      Certificate.countDocuments({ issuedByInstitute: inst._id }),
    ]);
    return res.json({
      role,
      stats: {
        instituteName: inst.name,
        verificationStatus: inst.verificationStatus,
        students,
        totalPrograms: programs.length,
        openPrograms,
        enrolledStudents: enrolled,
        completedParticipations: completedParts,
        verifiedHours: hours,
        certificatesIssued: certs,
      },
    });
  }

  if (role === 'admin') {
    const [roleAgg, orgsTotal, orgsVerified, institutesTotal, institutesVerified, activeRequests, completedRequests, volunteerHours, certificates, services] =
      await Promise.all([
        User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
        Organization.countDocuments({}),
        Organization.countDocuments({ verificationStatus: 'Verified' }),
        Institute.countDocuments({}),
        Institute.countDocuments({ verificationStatus: 'Verified' }),
        HelpRequest.countDocuments({ status: { $in: ['Pending', 'Accepted', 'In Progress'] } }),
        HelpRequest.countDocuments({ status: 'Completed' }),
        sumHours({}),
        Certificate.countDocuments({}),
        Service.countDocuments({}),
      ]);

    const usersByRole = {};
    roleAgg.forEach((r) => (usersByRole[r._id] = r.count));
    const totalUsers = roleAgg.reduce((s, r) => s + r.count, 0);

    return res.json({
      role,
      stats: {
        totalUsers,
        usersByRole,
        communityUsers: usersByRole.user || 0,
        providers: usersByRole.provider || 0,
        volunteers: usersByRole.volunteer || 0,
        organizations: orgsTotal,
        verifiedOrganizations: orgsVerified,
        institutes: institutesTotal,
        verifiedInstitutes: institutesVerified,
        services,
        activeRequests,
        completedRequests,
        volunteerHours,
        certificates,
      },
    });
  }

  res.json({ role, stats: {} });
});

module.exports = { dashboard };
