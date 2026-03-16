const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');

// GET /api/prescriptions/recent/:userId
router.get('/recent/:userId', auth, async (req, res) => {
  const patient = await Patient.findOne({ user: req.params.userId });
  if (!patient) return res.json([]);
  const prescriptions = await Prescription.find({ patient: patient._id, isActive: true })
    .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
    .sort({ createdAt: -1 }).limit(5);
  res.json(prescriptions);
});

// GET /api/prescriptions/patient/:userId
router.get('/patient/:userId', auth, async (req, res) => {
  const patient = await Patient.findOne({ user: req.params.userId });
  if (!patient) return res.json([]);
  const prescriptions = await Prescription.find({ patient: patient._id })
    .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
    .sort({ createdAt: -1 });
  res.json(prescriptions);
});

// GET /api/prescriptions/:id
router.get('/:id', auth, async (req, res) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
    .populate({ path: 'patient', populate: { path: 'user', select: '-password' } });
  if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
  res.json(prescription);
});

// POST /api/prescriptions - Create prescription
router.post('/', auth, async (req, res) => {
  const prescription = new Prescription(req.body);
  await prescription.save();
  res.status(201).json(prescription);
});

module.exports = router;
