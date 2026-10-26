const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'], trim: true },
    category: { type: String, required: [true, 'Category is required'], trim: true },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    date: { type: Date, required: [true, 'Date is required'] },
    startTime: { type: String, trim: true, default: '' },
    endTime: { type: String, trim: true, default: '' },
    serviceHours: { type: Number, required: true, min: 0.5 },
    requiredVolunteers: { type: Number, required: true, min: 1 },
    certificateEligible: { type: Boolean, default: true },
    requirements: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['Open', 'Closed', 'Completed'], default: 'Open' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VolunteerOpportunity', opportunitySchema);
