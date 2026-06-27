import Client from "../models/Client.js";
import { sendEmail } from "../lib/email.js";

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function submitForm(req, res, next) {
  try {
    const { email, name, formData } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });

    const otp = generateOtp();

    await Client.findOneAndUpdate(
      { email },
      { name, email, formData, otp, otpExpiry: Date.now() + 10 * 60 * 1000 },
      { upsert: true, new: true },
    );

    await sendEmail(
      email,
      "Your verification code",
      `Hi ${name || "there"},\n\nYour one-time verification code is:\n\n  ${otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.\n\n— The Onboarding Team`,
    );

    res.json({ message: "OTP sent" });
  } catch (err) {
    next(err);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const client = await Client.findOne({
      email,
      otp,
      otpExpiry: { $gt: Date.now() },
    });

    if (!client) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    client.emailVerified = true;
    client.emailVerifiedAt = new Date();
    client.consentGiven = true;
    client.consentTimestamp = new Date();
    client.consentIp = req.ip;
    client.otp = undefined;
    client.otpExpiry = undefined;
    await client.save();

    res.json({ message: "Email verified", clientId: client._id });
  } catch (err) {
    next(err);
  }
}
