const HelpRequest = require('../models/HelpRequest');
const ServiceProvider = require('../models/ServiceProvider');
const { asyncHandler, requireFields, HttpError, escapeRegex } = require('../utils/helpers');

const POPULATE = [
  { path: 'requester', select: 'name profileImage location phone' },
  { path: 'assignedProvider', select: 'name profileImage location phone' },
  { path: 'service', select: 'title pricingType price' },
];

const listRequests = asyncHandler(async (req, res) => {
  const { scope, status, category, location, urgency, pricingType, q } = req.query;
  const filter = {};

  if (scope === 'mine') filter.requester = req.user._id;
  else if (scope === 'assigned') filter.assignedProvider = req.user._id;
  else if (scope === 'open') {
    filter.status = 'Pending';
    filter.assignedProvider = null;
  }

  if (status) filter.status = status;
  if (category) filter.category = category;
  if (urgency) filter.urgency = urgency;
  if (pricingType) filter.pricingType = pricingType;
  if (location) filter.location = { $regex: escapeRegex(location), $options: 'i' };
  if (q) {
    const rx = { $regex: escapeRegex(q), $options: 'i' };
    filter.$or = [{ title: rx }, { description: rx }];
  }

  const requests = await HelpRequest.find(filter).populate(POPULATE).sort({ createdAt: -1 });
  res.json({ count: requests.length, requests });
});

const getRequest = asyncHandler(async (req, res) => {
  const request = await HelpRequest.findById(req.params.id).populate(POPULATE);
  if (!request) throw new HttpError(404, 'Help request not found.');
  res.json({ request });
});

const createRequest = asyncHandler(async (req, res) => {
  requireFields(req.body, ['title', 'description', 'category', 'location', 'urgency', 'pricingType']);
  if (req.body.pricingType === 'Paid' && !req.body.budget) {
    throw new HttpError(400, 'Please enter your budget for a paid request.');
  }
  const request = await HelpRequest.create({ ...req.body, requester: req.user._id });
  await request.populate(POPULATE);
  res.status(201).json({ request });
});

const updateRequest = asyncHandler(async (req, res) => {
  const request = await HelpRequest.findById(req.params.id);
  if (!request) throw new HttpError(404, 'Help request not found.');
  if (String(request.requester) !== String(req.user._id)) {
    throw new HttpError(403, 'You can only edit your own requests.');
  }
  if (request.status !== 'Pending') {
    throw new HttpError(400, 'Only pending requests can be edited.');
  }
  const editable = ['title', 'description', 'category', 'location', 'urgency', 'pricingType', 'budget', 'preferredDate', 'preferredTime'];
  editable.forEach((f) => {
    if (req.body[f] !== undefined) request[f] = req.body[f];
  });
  await request.save();
  res.json({ request });
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['Accepted', 'In Progress', 'Completed', 'Cancelled'].includes(status)) {
    throw new HttpError(400, 'Invalid status value.');
  }

  const request = await HelpRequest.findById(req.params.id);
  if (!request) throw new HttpError(404, 'Help request not found.');

  const isRequester = String(request.requester) === String(req.user._id);
  const isAssigned = request.assignedProvider && String(request.assignedProvider) === String(req.user._id);
  const isAdmin = req.user.role === 'admin';
  const canAccept = ['provider', 'volunteer', 'user'].includes(req.user.role);

  if (status === 'Accepted') {
    if (!canAccept) throw new HttpError(403, 'Only providers and volunteers can accept requests.');
    if (request.assignedProvider) {
      if (String(request.assignedProvider) === String(req.user._id)) {
        throw new HttpError(400, 'You have already accepted this request.');
      }
      throw new HttpError(400, 'This request has already been taken by another volunteer.');
    }
    if (request.status !== 'Pending') {
      throw new HttpError(400, 'This request is no longer available.');
    }
    request.assignedProvider = req.user._id;
    request.status = 'Accepted';
    request.acceptedAt = new Date();
  } else if (status === 'In Progress') {
    if (!isAssigned && !isAdmin) throw new HttpError(403, 'Only the accepted helper can start this request.');
    if (request.status !== 'Accepted') throw new HttpError(400, 'Only accepted requests can move to In Progress.');
    request.status = 'In Progress';
  } else if (status === 'Completed') {
    if (!isAssigned && !isRequester && !isAdmin) {
      throw new HttpError(403, 'Only the requester or the helper can complete this request.');
    }
    if (!['Accepted', 'In Progress'].includes(request.status)) {
      throw new HttpError(400, 'Only active requests can be completed.');
    }
    request.status = 'Completed';
    request.completedAt = new Date();
    if (request.assignedProvider) {
      const providerProfile = await ServiceProvider.findOne({ user: request.assignedProvider });
      if (providerProfile) providerProfile.completedServices += 1;
      if (providerProfile) await providerProfile.save();
    }
  } else if (status === 'Cancelled') {
    if (!isRequester && !isAdmin) throw new HttpError(403, 'Only the requester can cancel this request.');
    if (!['Pending', 'Accepted'].includes(request.status)) {
      throw new HttpError(400, 'Only pending or accepted requests can be cancelled.');
    }
    request.status = 'Cancelled';
  }

  await request.save();
  await request.populate(POPULATE);
  res.json({ request });
});

const deleteRequest = asyncHandler(async (req, res) => {
  const request = await HelpRequest.findById(req.params.id);
  if (!request) throw new HttpError(404, 'Help request not found.');
  const isOwner = String(request.requester) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    throw new HttpError(403, 'You can only delete your own requests.');
  }
  if (isOwner && !['Pending', 'Cancelled'].includes(request.status) && req.user.role !== 'admin') {
    throw new HttpError(400, 'Only pending or cancelled requests can be deleted.');
  }
  await request.deleteOne();
  res.json({ message: 'Help request removed.' });
});

module.exports = { listRequests, getRequest, createRequest, updateRequest, updateStatus, deleteRequest };
