const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MedicationReminder = require('../models/MedicationReminder');
const Patient = require('../models/Patient');

// GET /api/medications/patient/:userId
router.get('/patient/:userId', auth, async (req, res) => {
  const patient = await Patient.findOne({ user: req.params.userId });
  if (!patient) return res.json([]);
  const meds = await MedicationReminder.find({ patient: patient._id, isActive: true }).sort({ createdAt: -1 });
  res.json(meds);
});

// POST /api/medications - Create reminder
router.post('/', auth, async (req, res) => {
  const patient = await Patient.findOne({ user: req.body.patientUserId || req.user.id });
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  const med = new MedicationReminder({ ...req.body, patient: patient._id });
  await med.save();
  res.status(201).json(med);
});

// PUT /api/medications/:id - Update reminder
router.put('/:id', auth, async (req, res) => {
  const med = await MedicationReminder.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(med);
});

// DELETE /api/medications/:id - Deactivate reminder
router.delete('/:id', auth, async (req, res) => {
  await MedicationReminder.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true });
});

// POST /api/medications/:id/taken - Log taken status
router.post('/:id/taken', auth, async (req, res) => {
  const med = await MedicationReminder.findById(req.params.id);
  if (!med) return res.status(404).json({ message: 'Medication not found' });
  med.takenLog.push({ date: new Date(), taken: req.body.taken });
  await med.save();
  res.json({ success: true });
});

module.exports = router;
