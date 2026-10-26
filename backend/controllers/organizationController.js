const Organization = require('../models/Organization');
const VolunteerOpportunity = require('../models/VolunteerOpportunity');
const { asyncHandler, requireFields, HttpError, escapeRegex } = require('../utils/helpers');

const listOrganizations = asyncHandler(async (req, res) => {
  const { type, cause, location, q, verificationStatus } = req.query;
  const filter = {};

  if (type === 'sahayseva') filter.organizationType = 'SahaySeva Organization';
  if (type === 'external') filter.organizationType = { $in: ['External Organization', 'Demo Organization'] };
  if (verificationStatus) filter.verificationStatus = verificationStatus;
  if (cause) filter.causes = { $in: [cause] };
  if (location) filter.location = { $regex: escapeRegex(location), $options: 'i' };
  if (q) {
    const rx = { $regex: escapeRegex(q), $options: 'i' };
    filter.$or = [{ name: rx }, { description: rx }];
  }

  const organizations = await Organization.find(filter)
    .populate('owner', 'name')
    .sort({ verificationStatus: 1, createdAt: -1 });

  const withCounts = await Promise.all(
    organizations.map(async (org) => {
      const openOpportunities =
        org.organizationType === 'SahaySeva Organization'
          ? await VolunteerOpportunity.countDocuments({ organization: org._id, status: 'Open' })
          : 0;
      return { ...org.toJSON(), openOpportunities };
    })
  );

  res.json({ count: withCounts.length, organizations: withCounts });
});

const getOrganization = asyncHandler(async (req, res) => {
  const organization = await Organization.findById(req.params.id).populate('owner', 'name email');
  if (!organization) throw new HttpError(404, 'Organization not found.');

  const opportunities =
    organization.organizationType === 'SahaySeva Organization'
      ? await VolunteerOpportunity.find({ organization: organization._id }).sort({ date: 1 })
      : [];

  res.json({ organization, opportunities });
});

const updateOrganization = asyncHandler(async (req, res) => {
  const organization = await Organization.findById(req.params.id);
  if (!organization) throw new HttpError(404, 'Organization not found.');
  if (organization.owner && String(organization.owner._id) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new HttpError(403, 'You can only manage your own organization profile.');
  }

  const editable = ['name', 'description', 'causes', 'location', 'contact', 'officialWebsite'];
  editable.forEach((f) => {
    if (req.body[f] !== undefined) organization[f] = req.body[f];
  });
  await organization.save();
  res.json({ organization });
});

const verifyOrganization = asyncHandler(async (req, res) => {
  const { verificationStatus } = req.body;
  if (!['Pending Verification', 'Verified', 'Rejected'].includes(verificationStatus)) {
    throw new HttpError(400, 'Invalid verification status.');
  }
  const organization = await Organization.findById(req.params.id);
  if (!organization) throw new HttpError(404, 'Organization not found.');
  organization.verificationStatus = verificationStatus;
  await organization.save();
  res.json({ organization });
});

const createExternalOrganization = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name', 'organizationType']);
  if (!['External Organization', 'Demo Organization'].includes(req.body.organizationType)) {
    throw new HttpError(400, 'Admins can only create External or Demo organization records.');
  }
  const organization = await Organization.create({ ...req.body, owner: null });
  res.status(201).json({ organization });
});

const deleteOrganization = asyncHandler(async (req, res) => {
  const organization = await Organization.findById(req.params.id);
  if (!organization) throw new HttpError(404, 'Organization not found.');
  const isOwner = organization.owner && String(organization.owner._id) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    throw new HttpError(403, 'You do not have permission to remove this organization.');
  }
  await organization.deleteOne();
  res.json({ message: 'Organization removed.' });
});

module.exports = {
  listOrganizations,
  getOrganization,
  updateOrganization,
  verifyOrganization,
  createExternalOrganization,
  deleteOrganization,
};
