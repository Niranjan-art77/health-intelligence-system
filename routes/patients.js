const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Vitals = require('../models/Vitals');

// GET /api/patients - Admin: list all patients
router.get('/', auth, async (req, res) => {
  const patients = await Patient.find().populate('user', '-password').sort({ createdAt: -1 });
  res.json(patients);
});

// GET /api/patients/my-profile - Patient: get own profile
router.get('/my-profile', auth, async (req, res) => {
  const patient = await Patient.findOne({ user: req.user.id }).populate('user', '-password');
  if (!patient) return res.status(404).json({ message: 'Patient profile not found' });
  res.json(patient);
});

// GET /api/patients/:id - Get patient by user ID
router.get('/:id', auth, async (req, res) => {
  const patient = await Patient.findOne({ user: req.params.id }).populate('user', '-password');
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.json(patient);
});

// GET /api/patients/:id/timeline
router.get('/:id/timeline', auth, async (req, res) => {
  const patient = await Patient.findOne({ user: req.params.id });
  if (!patient) return res.json([]);
  res.json(patient.timeline || []);
});

// POST /api/patients/:id/timeline - Add timeline event
router.post('/:id/timeline', auth, async (req, res) => {
  const patient = await Patient.findOne({ user: req.params.id });
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  patient.timeline.unshift({ eventType: req.body.eventType, description: req.body.description });
  await patient.save();
  res.json(patient.timeline);
});

// GET /api/patients/:id/vitals
router.get('/:id/vitals', auth, async (req, res) => {
  const patient = await Patient.findOne({ user: req.params.id });
  if (!patient) return res.json([]);
  const vitals = await Vitals.find({ patient: patient._id }).sort({ recordedAt: -1 }).limit(30);
  res.json(vitals);
});

// PUT /api/patients/:id - Update patient profile
router.put('/:id', auth, async (req, res) => {
  const patient = await Patient.findOneAndUpdate(
    { user: req.params.id },
    { $set: req.body },
    { new: true }
  ).populate('user', '-password');
  res.json(patient);
});

module.exports = router;
