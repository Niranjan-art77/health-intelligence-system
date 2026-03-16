const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Billing = require('../models/Billing');
const Patient = require('../models/Patient');

router.get('/patient/:userId', auth, async (req, res) => {
  const patient = await Patient.findOne({ user: req.params.userId });
  if (!patient) return res.json([]);
  const bills = await Billing.find({ patient: patient._id }).sort({ createdAt: -1 });
  res.json(bills);
});

router.post('/', auth, async (req, res) => {
  const billing = new Billing(req.body);
  await billing.save();
  res.status(201).json(billing);
});

router.post('/pay/:billId', auth, async (req, res) => {
  const bill = await Billing.findByIdAndUpdate(
    req.params.billId,
    { status: 'PAID', paymentMethod: req.body.method, paidAt: new Date() },
    { new: true }
  );
  res.json({ success: true, bill });
});

router.get('/', auth, async (req, res) => {
  const bills = await Billing.find().populate({ path: 'patient', populate: { path: 'user', select: '-password' } }).sort({ createdAt: -1 });
  res.json(bills);
});

module.exports = router;
