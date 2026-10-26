const VolunteerOpportunity = require('../models/VolunteerOpportunity');
const Organization = require('../models/Organization');
const VolunteerApplication = require('../models/VolunteerApplication');
const { asyncHandler, requireFields, HttpError, escapeRegex } = require('../utils/helpers');

const POPULATE_ORG = { path: 'organization', select: 'name location verificationStatus organizationType' };

const listOpportunities = asyncHandler(async (req, res) => {
  const { q, category, location, date, status, organization, mine } = req.query;
  const filter = {};

  if (mine === '1' && req.user) {
    const org = await Organization.findOne({ owner: req.user._id });
    filter.organization = org ? org._id : null;
  } else if (organization) filter.organization = organization;
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (location) filter.location = { $regex: escapeRegex(location), $options: 'i' };
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    filter.date = { $gte: start, $lte: end };
  }
  if (q) {
    const rx = { $regex: escapeRegex(q), $options: 'i' };
    filter.$or = [{ title: rx }, { description: rx }];
  }

  const opportunities = await VolunteerOpportunity.find(filter)
    .populate(POPULATE_ORG)
    .sort({ date: 1 });

  res.json({ count: opportunities.length, opportunities });
});

const getOpportunity = asyncHandler(async (req, res) => {
  const opportunity = await VolunteerOpportunity.findById(req.params.id).populate(POPULATE_ORG);
  if (!opportunity) throw new HttpError(404, 'Volunteer opportunity not found.');

  const acceptedCount = await VolunteerApplication.countDocuments({
    opportunity: opportunity._id,
    status: { $in: ['Accepted', 'Completed'] },
  });

  res.json({ opportunity, acceptedCount });
});

const createOpportunity = asyncHandler(async (req, res) => {
  requireFields(req.body, ['title', 'description', 'category', 'location', 'date', 'serviceHours', 'requiredVolunteers']);
  const org = await Organization.findOne({ owner: req.user._id });
  if (!org) throw new HttpError(404, 'Please create your organization profile first.');
  const opportunity = await VolunteerOpportunity.create({
    ...req.body,
    organization: org._id,
  });
  await opportunity.populate(POPULATE_ORG);
  res.status(201).json({ opportunity });
});

const updateOpportunity = asyncHandler(async (req, res) => {
  const opportunity = await VolunteerOpportunity.findById(req.params.id);
  if (!opportunity) throw new HttpError(404, 'Volunteer opportunity not found.');
  const org = await Organization.findById(opportunity.organization);
  if (req.user.role !== 'admin' && String(org.owner) !== String(req.user._id)) {
    throw new HttpError(403, 'You can only manage opportunities posted by your organization.');
  }
  const editable = ['title', 'description', 'category', 'location', 'date', 'startTime', 'endTime', 'serviceHours', 'requiredVolunteers', 'certificateEligible', 'requirements', 'status'];
  editable.forEach((f) => {
    if (req.body[f] !== undefined) opportunity[f] = req.body[f];
  });
  await opportunity.save();
  res.json({ opportunity });
});

const deleteOpportunity = asyncHandler(async (req, res) => {
  const opportunity = await VolunteerOpportunity.findById(req.params.id);
  if (!opportunity) throw new HttpError(404, 'Volunteer opportunity not found.');
  const org = await Organization.findById(opportunity.organization);
  if (req.user.role !== 'admin' && String(org.owner) !== String(req.user._id)) {
    throw new HttpError(403, 'You can only manage opportunities posted by your organization.');
  }
  await opportunity.deleteOne();
  res.json({ message: 'Opportunity removed.' });
});

module.exports = { listOpportunities, getOpportunity, createOpportunity, updateOpportunity, deleteOpportunity };
