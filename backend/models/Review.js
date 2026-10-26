const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    target: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    helpRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'HelpRequest', default: null },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: '', maxlength: 1000 },
  },
  { timestamps: true }
);

reviewSchema.index({ reviewer: 1, helpRequest: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Review', reviewSchema);
