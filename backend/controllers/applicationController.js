const VolunteerApplication = require('../models/VolunteerApplication');
const VolunteerOpportunity = require('../models/VolunteerOpportunity');
const Organization = require('../models/Organization');
const Participation = require('../models/Participation');
const { asyncHandler, HttpError } = require('../utils/helpers');

const apply = asyncHandler(async (req, res) => {
  if (!['user', 'volunteer'].includes(req.user.role)) {
    throw new HttpError(403, 'Only community users and volunteers can apply for opportunities.');
  }
  const opportunity = await VolunteerOpportunity.findById(req.params.id);
  if (!opportunity) throw new HttpError(404, 'Volunteer opportunity not found.');
  if (opportunity.status !== 'Open') {
    throw new HttpError(400, 'This opportunity is not open for applications.');
  }

  const existing = await VolunteerApplication.findOne({
    opportunity: opportunity._id,
    volunteer: req.user._id,
  });
  if (existing) throw new HttpError(400, 'You have already applied for this opportunity.');

  const acceptedCount = await VolunteerApplication.countDocuments({
    opportunity: opportunity._id,
    status: { $in: ['Accepted', 'Completed'] },
  });
  if (acceptedCount >= opportunity.requiredVolunteers) {
    throw new HttpError(400, 'This opportunity has reached its volunteer limit.');
  }

  const application = await VolunteerApplication.create({
    opportunity: opportunity._id,
    volunteer: req.user._id,
  });
  await application.populate('opportunity', 'title date serviceHours');
  res.status(201).json({ application });
});

const myApplications = asyncHandler(async (req, res) => {
  const applications = await VolunteerApplication.find({ volunteer: req.user._id })
    .populate({ path: 'opportunity', populate: { path: 'organization', select: 'name location organizationType' } })
    .sort({ appliedAt: -1 });
  res.json({ count: applications.length, applications });
});

const listApplications = asyncHandler(async (req, res) => {
  const org = await Organization.findOne({ owner: req.user._id });
  if (!org) return res.json({ count: 0, applications: [] });

  const opportunities = await VolunteerOpportunity.find({ organization: org._id }).select('_id');
  const applications = await VolunteerApplication.find({
    opportunity: { $in: opportunities.map((o) => o._id) },
  })
    .populate('volunteer', 'name email phone profileImage location')
    .populate('opportunity', 'title date serviceHours status')
    .sort({ appliedAt: -1 });

  res.json({ count: applications.length, applications });
});

const updateApplication = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['Accepted', 'Rejected', 'Completed'].includes(status)) {
    throw new HttpError(400, 'Invalid application status.');
  }

  const application = await VolunteerApplication.findById(req.params.id).populate('opportunity');
  if (!application) throw new HttpError(404, 'Application not found.');

  const opportunity = await VolunteerOpportunity.findById(application.opportunity._id);
  const org = await Organization.findById(opportunity.organization);
  if (req.user.role !== 'admin' && String(org.owner) !== String(req.user._id)) {
    throw new HttpError(403, 'Only the organization managing this opportunity can update applications.');
  }

  if (status === 'Accepted') {
    if (application.status !== 'Applied') {
      throw new HttpError(400, 'Only pending applications can be accepted.');
    }
    const acceptedCount = await VolunteerApplication.countDocuments({
      opportunity: opportunity._id,
      status: { $in: ['Accepted', 'Completed'] },
      _id: { $ne: application._id },
    });
    if (acceptedCount >= opportunity.requiredVolunteers) {
      throw new HttpError(400, 'Volunteer slots are full.');
    }
    application.acceptedAt = new Date();
  }
  if (status === 'Rejected') {
    if (application.status === 'Completed') {
      throw new HttpError(400, 'Completed applications cannot be rejected.');
    }
    application.rejectedAt = new Date();
  }
  if (status === 'Completed') {
    if (application.status !== 'Accepted') {
      throw new HttpError(400, 'Only accepted applications can be marked as completed.');
    }
    application.completedAt = new Date();
    if (opportunity.status !== 'Completed') {
      opportunity.status = 'Completed';
      await opportunity.save();
    }
    const existingParticipation = await Participation.findOne({
      participant: application.volunteer,
      opportunity: opportunity._id,
    });
    if (!existingParticipation) {
      await Participation.create({
        participant: application.volunteer,
        organization: org._id,
        opportunity: opportunity._id,
        serviceHours: opportunity.serviceHours,
        completionStatus: 'Completed',
        verificationStatus: 'Verified',
        completionDate: new Date(),
        verifiedBy: req.user._id,
      });
    }
  }

  application.status = status;
  await application.save();
  await application.populate([
    { path: 'volunteer', select: 'name email profileImage' },
    { path: 'opportunity', select: 'title date serviceHours' },
  ]);
  res.json({ application });
});

module.exports = { apply, myApplications, listApplications, updateApplication };

