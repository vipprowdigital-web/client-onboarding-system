import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, lowercase: true },
  emailVerified: { type: Boolean, default: false },
  emailVerifiedAt: Date,
  formData: Object,
  consentGiven: { type: Boolean, default: false },
  consentTimestamp: Date,
  consentIp: String,
  otp: String,
  otpExpiry: Date,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Client', clientSchema);
