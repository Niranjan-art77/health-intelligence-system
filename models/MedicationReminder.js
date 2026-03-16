const mongoose = require('mongoose');

const medicationReminderSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  medicineName: { type: String, required: true },
  dosage: String,
  frequency: { type: String, enum: ['ONCE', 'TWICE', 'THRICE', 'FOUR_TIMES', 'AS_NEEDED'], default: 'ONCE' },
  times: [{ hour: Number, minute: Number, label: String }],
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  isActive: { type: Boolean, default: true },
  notes: String,
  takenLog: [{ date: { type: Date, default: Date.now }, taken: Boolean }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MedicationReminder', medicationReminderSchema);
