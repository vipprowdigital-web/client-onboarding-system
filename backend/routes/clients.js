import { Router } from 'express';
import Client from '../models/Client.js';

const router = Router();

router.post('/', async (req, res) => {
  const { name, email, formData, consentGiven } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const client = await Client.create({
    name,
    email,
    formData,
    consentGiven,
    consentTimestamp: consentGiven ? new Date() : undefined,
    consentIp: req.ip,
  });

  res.status(201).json({ client });
});

export default router;
