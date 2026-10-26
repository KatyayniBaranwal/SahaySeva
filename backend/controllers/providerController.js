const ServiceProvider = require('../models/ServiceProvider');
const Review = require('../models/Review');
const { asyncHandler, HttpError, escapeRegex } = require('../utils/helpers');

const listProviders = asyncHandler(async (req, res) => {
  const { q, category, location, pricingType, minRating } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (pricingType) filter.pricingType = pricingType;
  if (location) filter.location = { $regex: escapeRegex(location), $options: 'i' };
  if (q) filter.description = { $regex: escapeRegex(q), $options: 'i' };
  if (minRating) filter.rating = { $gte: Number(minRating) };

  const providers = await ServiceProvider.find(filter)
    .populate('user', 'name profileImage location email')
    .sort({ rating: -1, completedServices: -1 });

  res.json({ count: providers.length, providers });
});

const getProvider = asyncHandler(async (req, res) => {
  const provider = await ServiceProvider.findById(req.params.id).populate(
    'user',
    'name profileImage location email phone'
  );
  if (!provider) throw new HttpError(404, 'Service provider not found.');

  const reviews = await Review.find({ target: provider.user._id })
    .populate('reviewer', 'name profileImage')
    .sort({ createdAt: -1 });

  res.json({ provider, reviews });
});

const getMyProfile = asyncHandler(async (req, res) => {
  let provider = await ServiceProvider.findOne({ user: req.user._id });
  if (!provider) {
    provider = await ServiceProvider.create({ user: req.user._id, location: req.user.location });
  }
  res.json({ provider });
});

const updateMyProfile = asyncHandler(async (req, res) => {
  let provider = await ServiceProvider.findOne({ user: req.user._id });
  if (!provider) {
    provider = await ServiceProvider.create({ user: req.user._id });
  }

  const fields = ['description', 'category', 'location', 'availability', 'pricingType', 'price'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) provider[f] = req.body[f];
  });
  await provider.save();

  res.json({ provider });
});

module.exports = { listProviders, getProvider, getMyProfile, updateMyProfile };
