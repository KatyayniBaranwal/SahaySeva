const mongoose = require('mongoose');

const ORGANIZATION_TYPES = [
  'SahaySeva Organization',
  'External Organization',
  'Demo Organization',
];

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Organization name is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    causes: [{ type: String, trim: true }],
    location: { type: String, trim: true, default: '' },
    contact: {
      email: { type: String, trim: true, default: '' },
      phone: { type: String, trim: true, default: '' },
    },
    officialWebsite: { type: String, trim: true, default: '' },
    verificationStatus: {
      type: String,
      enum: ['Pending Verification', 'Verified', 'Rejected'],
      default: 'Pending Verification',
    },
    organizationType: {
      type: String,
      enum: ORGANIZATION_TYPES,
      default: 'SahaySeva Organization',
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Organization', organizationSchema);
module.exports.ORGANIZATION_TYPES = ORGANIZATION_TYPES;
