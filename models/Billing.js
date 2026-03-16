const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  amount: { type: Number, required: true },
  description: String,
  status: { type: String, enum: ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'], default: 'PENDING' },
  paymentMethod: { type: String, enum: ['UPI', 'CARD', 'CASH', 'INSURANCE'] },
  paidAt: Date,
  dueDate: Date,
  invoiceNumber: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

billingSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Billing').countDocuments();
    this.invoiceNumber = `INV${String(count + 10001).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Billing', billingSchema);
