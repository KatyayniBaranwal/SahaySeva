const mongoose = require('mongoose');

const instituteSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Institute name is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    contact: {
      email: { type: String, trim: true, default: '' },
      phone: { type: String, trim: true, default: '' },
    },
    verificationStatus: {
      type: String,
      enum: ['Pending Verification', 'Verified', 'Rejected'],
      default: 'Pending Verification',
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Institute', instituteSchema);
