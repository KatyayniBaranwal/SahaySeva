const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    certificateId: { type: String, required: true, unique: true },
    recipientName: { type: String, required: true, trim: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationName: { type: String, required: true, trim: true },
    activityName: { type: String, required: true, trim: true },
    serviceHours: { type: Number, required: true, min: 0 },
    completionDate: { type: Date, required: true },
    issuer: { type: String, required: true, trim: true },
    issuerType: { type: String, enum: ['Organization', 'Institute'], required: true },
    issuedByOrganization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
    issuedByInstitute: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', default: null },
    sourceModel: { type: String, enum: ['VolunteerApplication', 'Participation'] },
    sourceId: { type: mongoose.Schema.Types.ObjectId },
    verificationStatus: { type: String, enum: ['Valid', 'Revoked'], default: 'Valid' },
    verificationData: {
      verifiedUrl: { type: String, default: '' },
      certificateId: { type: String, default: '' },
      issuedAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certificate', certificateSchema);
