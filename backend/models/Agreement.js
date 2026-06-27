import mongoose from 'mongoose';

const agreementSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  templateVersion: String,
  generatedPdfPath: String,
  generatedPdfHash: String,
  signatureRequestId: String,
  status: { type: String, enum: ['draft', 'sent', 'signed', 'declined', 'expired'], default: 'draft' },
  signedPdfPath: String,
  signedPdfHash: String,
  signerEmail: String,
  signedAt: Date,
  signerIp: String,
  auditTrailUrl: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Agreement', agreementSchema);
