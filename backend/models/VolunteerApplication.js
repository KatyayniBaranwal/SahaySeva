const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VolunteerOpportunity',
      required: true,
    },
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['Applied', 'Accepted', 'Rejected', 'Completed'],
      default: 'Applied',
    },
    appliedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
    rejectedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

applicationSchema.index({ opportunity: 1, volunteer: 1 }, { unique: true });

module.exports = mongoose.model('VolunteerApplication', applicationSchema);
