const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema(
  {
    participant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    institute: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', default: null },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
    program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', default: null },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VolunteerOpportunity',
      default: null,
    },
    serviceHours: { type: Number, required: true, min: 0 },
    completionStatus: {
      type: String,
      enum: ['Enrolled', 'Completed'],
      default: 'Enrolled',
    },
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
    },
    completionDate: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Participation', participationSchema);
