import { Router } from 'express';
import { submitForm, verifyOtp } from '../controllers/onboarding.controller.js';

const router = Router();

router.post('/submit-form', submitForm);
router.post('/verify-otp', verifyOtp);

export default router;
