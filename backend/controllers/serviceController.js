const Service = require('../models/Service');
const ServiceProvider = require('../models/ServiceProvider');
const Review = require('../models/Review');
const User = require('../models/User');
const { asyncHandler, requireFields, HttpError, escapeRegex } = require('../utils/helpers');

const getMyProviderProfile = async (userId) => {
  let provider = await ServiceProvider.findOne({ user: userId });
  if (!provider) provider = await ServiceProvider.create({ user: userId });
  return provider;
};

const listServices = asyncHandler(async (req, res) => {
  const { q, category, location, pricingType, provider, sort } = req.query;
  const filter = { status: 'Active' };

  if (category) filter.category = category;
  if (pricingType) filter.pricingType = pricingType;
  if (provider) filter.provider = provider;
  if (location) filter.location = { $regex: escapeRegex(location), $options: 'i' };
  if (q) {
    const rx = { $regex: escapeRegex(q), $options: 'i' };
    filter.$or = [{ title: rx }, { description: rx }];
  }

  let query = Service.find(filter).populate({
    path: 'provider',
    populate: { path: 'user', select: 'name profileImage' },
  });

  if (sort === 'priceLow') query = query.sort({ price: 1 });
  else if (sort === 'priceHigh') query = query.sort({ price: -1 });
  else if (sort === 'rating')
    query = query.sort({ 'provider.rating': -1 }).sort({ createdAt: -1 });
  else query = query.sort({ createdAt: -1 });

  const services = await query;
  res.json({ count: services.length, services });
});

const getService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id).populate({
    path: 'provider',
    populate: { path: 'user', select: 'name profileImage location phone email' },
  });
  if (!service) throw new HttpError(404, 'Service not found.');

  const reviews = await Review.find({ target: service.provider.user._id })
    .populate('reviewer', 'name profileImage')
    .sort({ createdAt: -1 });

  res.json({ service, reviews });
});

const createService = asyncHandler(async (req, res) => {
  requireFields(req.body, ['title', 'description', 'category', 'location', 'pricingType']);
  if (req.body.pricingType === 'Paid' && !req.body.price) {
    throw new HttpError(400, 'Price is required for a paid service.');
  }
  const provider = await getMyProviderProfile(req.user._id);
  const service = await Service.create({ ...req.body, provider: provider._id });
  await service.populate({ path: 'provider', populate: { path: 'user', select: 'name' } });
  res.status(201).json({ service });
});

const updateService = asyncHandler(async (req, res) => {
  const provider = await getMyProviderProfile(req.user._id);
  const service = await Service.findById(req.params.id);
  if (!service) throw new HttpError(404, 'Service not found.');
  if (String(service.provider) !== String(provider._id)) {
    throw new HttpError(403, 'You can only edit your own services.');
  }
  Object.assign(service, req.body);
  await service.save();
  res.json({ service });
});

const deleteService = asyncHandler(async (req, res) => {
  const provider = await getMyProviderProfile(req.user._id);
  const service = await Service.findById(req.params.id);
  if (!service) throw new HttpError(404, 'Service not found.');
  const isOwner = String(service.provider) === String(provider._id);
  if (!isOwner && req.user.role !== 'admin') {
    throw new HttpError(403, 'You can only delete your own services.');
  }
  await service.deleteOne();
  res.json({ message: 'Service removed.' });
});

const toggleSave = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) throw new HttpError(404, 'Service not found.');

  const user = await User.findById(req.user._id);
  const index = user.savedServices.findIndex(
    (s) => String(s) === String(service._id)
  );
  if (index >= 0) {
    user.savedServices.splice(index, 1);
  } else {
    user.savedServices.push(service._id);
  }
  await user.save();
  res.json({ saved: index < 0, savedServices: user.savedServices });
});

const listSaved = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'savedServices',
    populate: { path: 'provider', populate: { path: 'user', select: 'name profileImage' } },
  });
  res.json({ count: user.savedServices.length, services: user.savedServices });
});

module.exports = { listServices, getService, createService, updateService, deleteService, toggleSave, listSaved };
