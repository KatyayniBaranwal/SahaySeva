const Review = require('../models/Review');
const HelpRequest = require('../models/HelpRequest');
const ServiceProvider = require('../models/ServiceProvider');
const { asyncHandler, requireFields, HttpError } = require('../utils/helpers');

const listReviews = asyncHandler(async (req, res) => {
  const { targetId } = req.query;
  if (!targetId) throw new HttpError(400, 'targetId query parameter is required.');
  const reviews = await Review.find({ target: targetId })
    .populate('reviewer', 'name profileImage')
    .populate('helpRequest', 'title')
    .sort({ createdAt: -1 });
  res.json({ count: reviews.length, reviews });
});

const myReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ reviewer: req.user._id })
    .populate('target', 'name')
    .populate('helpRequest', 'title')
    .sort({ createdAt: -1 });
  res.json({ count: reviews.length, reviews });
});

const createReview = asyncHandler(async (req, res) => {
  requireFields(req.body, ['targetId', 'requestId', 'rating']);
  const rating = Number(req.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new HttpError(400, 'Rating must be a whole number between 1 and 5.');
  }

  const request = await HelpRequest.findById(req.body.requestId);
  if (!request) throw new HttpError(404, 'Help request not found.');
  if (request.status !== 'Completed') {
    throw new HttpError(400, 'Reviews can only be given after the request is completed.');
  }
  if (String(request.requester) !== String(req.user._id)) {
    throw new HttpError(403, 'Only the requester can review this service.');
  }
  if (!request.assignedProvider || String(request.assignedProvider) !== String(req.body.targetId)) {
    throw new HttpError(400, 'You can only review the person who handled your request.');
  }

  const existing = await Review.findOne({ reviewer: req.user._id, helpRequest: request._id });
  if (existing) throw new HttpError(400, 'You have already reviewed this request.');

  const review = await Review.create({
    reviewer: req.user._id,
    target: req.body.targetId,
    helpRequest: request._id,
    rating,
    comment: req.body.comment || '',
  });

  const agg = await Review.aggregate([
    { $match: { target: request.assignedProvider } },
    { $group: { _id: '$target', avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } },
  ]);
  if (agg.length) {
    await ServiceProvider.updateOne(
      { user: request.assignedProvider },
      {
        rating: Math.round(agg[0].avgRating * 10) / 10,
        numReviews: agg[0].numReviews,
      }
    );
  }

  await review.populate('reviewer', 'name profileImage');
  res.status(201).json({ review });
});

module.exports = { listReviews, myReviews, createReview };
