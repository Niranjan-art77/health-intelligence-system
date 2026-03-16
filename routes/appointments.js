const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');

// GET /api/appointments/patient/:userId
router.get('/patient/:userId', auth, async (req, res) => {
  const patient = await Patient.findOne({ user: req.params.userId });
  if (!patient) return res.json([]);
  const appointments = await Appointment.find({ patient: patient._id })
    .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
    .sort({ appointmentTime: -1 });
  res.json(appointments);
});

// GET /api/appointments/doctor/:userId
router.get('/doctor/:userId', auth, async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.params.userId });
  if (!doctor) return res.json([]);
  const appointments = await Appointment.find({ doctor: doctor._id })
    .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
    .sort({ appointmentTime: -1 });
  res.json(appointments);
});

// GET /api/appointments - Admin: list all
router.get('/', auth, async (req, res) => {
  const appointments = await Appointment.find()
    .populate({ path: 'doctor', populate: { path: 'user', select: '-password' } })
    .populate({ path: 'patient', populate: { path: 'user', select: '-password' } })
    .sort({ appointmentTime: -1 });
  res.json(appointments);
});

// POST /api/appointments - Book appointment
router.post('/', auth, async (req, res) => {
  const { doctorId, patientUserId, appointmentTime, reason, type, symptoms } = req.body;
  const patient = await Patient.findOne({ user: patientUserId || req.user.id });
  const doctor = await Doctor.findById(doctorId);
  if (!patient || !doctor) return res.status(404).json({ message: 'Patient or Doctor not found' });

  const appointment = new Appointment({ patient: patient._id, doctor: doctor._id, appointmentTime, reason, type, symptoms, status: 'CONFIRMED' });
  await appointment.save();

  // Create notification
  await Notification.create({
    user: patient.user,
    title: 'Appointment Confirmed',
    message: `Your appointment with Dr. ${doctor.user} on ${new Date(appointmentTime).toDateString()} has been confirmed.`,
    type: 'APPOINTMENT'
  });

  // Add to timeline
  patient.timeline.unshift({ eventType: 'APPOINTMENT_BOOKED', description: `Appointment booked for ${new Date(appointmentTime).toDateString()}` });
  await patient.save();

  const populated = await appointment.populate([
    { path: 'doctor', populate: { path: 'user', select: '-password' } },
    { path: 'patient', populate: { path: 'user', select: '-password' } }
  ]);
  res.status(201).json(populated);
});

// PUT /api/appointments/:id/status - Update status
router.put('/:id/status', auth, async (req, res) => {
  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  res.json(appointment);
});

// DELETE /api/appointments/:id
router.delete('/:id', auth, async (req, res) => {
  await Appointment.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Appointment cancelled' });
});

module.exports = router;
