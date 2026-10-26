const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'], trim: true },
    category: { type: String, required: [true, 'Category is required'], trim: true },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    urgency: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Emergency'],
      default: 'Medium',
    },
    pricingType: { type: String, enum: ['Free', 'Paid'], default: 'Free' },
    budget: { type: Number, default: 0, min: 0 },
    preferredDate: { type: Date },
    preferredTime: { type: String, trim: true, default: '' },
    assignedProvider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', default: null },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    acceptedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HelpRequest', helpRequestSchema);
