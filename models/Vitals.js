const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  heartRate: Number,
  bloodPressure: String,
  temperature: Number,
  oxygenLevel: Number,
  respiratoryRate: Number,
  weight: Number,
  glucose: Number,
  recordedAt: { type: Date, default: Date.now },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String
});

module.exports = mongoose.model('Vitals', vitalsSchema);
