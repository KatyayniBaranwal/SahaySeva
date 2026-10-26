const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    description: { type: String, trim: true, default: '' },
    category: { type: String, trim: true, default: 'Other' },
    location: { type: String, trim: true, default: '' },
    availability: { type: String, trim: true, default: '' },
    pricingType: { type: String, enum: ['Free', 'Paid'], default: 'Free' },
    price: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    completedServices: { type: Number, default: 0 },
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ServiceProvider', providerSchema);
