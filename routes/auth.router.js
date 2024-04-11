const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { validateUser, validatePassword } = require('../validators/auth.validator')

router.post('/login', authController.login);

router.post('/register', validateUser, authController.register);

router.post('/forgot-password', authController.forgotPassword);

router.post('/verify-otp', authController.verifyPasswordResetOTP);

router.post('/reset-password', validatePassword, authController.resetPassword);

router.get('/verify-token', authController.verifyToken);

module.exports = router;