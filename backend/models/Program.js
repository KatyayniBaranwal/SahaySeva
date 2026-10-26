const mongoose = require('mongoose');

const programSchema = new mongoose.Schema(
  {
    institute: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
    title: { type: String, required: [true, 'Program title is required'], trim: true },
    description: { type: String, required: [true, 'Program description is required'], trim: true },
    category: { type: String, required: [true, 'Category is required'], trim: true },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    date: { type: Date, required: [true, 'Date is required'] },
    startTime: { type: String, trim: true, default: '' },
    endTime: { type: String, trim: true, default: '' },
    serviceHours: { type: Number, required: true, min: 0.5 },
    requiredStudents: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['Open', 'Closed', 'Completed'], default: 'Open' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Program', programSchema);
