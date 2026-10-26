const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceProvider', required: true },
    title: { type: String, required: [true, 'Service title is required'], trim: true },
    description: { type: String, required: [true, 'Service description is required'], trim: true },
    category: { type: String, required: [true, 'Category is required'], trim: true },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    pricingType: { type: String, enum: ['Free', 'Paid'], required: true },
    price: { type: Number, default: 0, min: 0 },
    availability: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

serviceSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Service', serviceSchema);
