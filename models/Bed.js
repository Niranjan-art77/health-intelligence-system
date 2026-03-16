const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  bedNumber: { type: String, required: true, unique: true },
  ward: { type: String, required: true },
  type: { type: String, enum: ['GENERAL', 'ICU', 'EMERGENCY', 'PRIVATE', 'SEMI_PRIVATE'], default: 'GENERAL' },
  status: { type: String, enum: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED'], default: 'AVAILABLE' },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  floor: Number,
  features: [String],
  admittedAt: Date,
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bed', bedSchema);
