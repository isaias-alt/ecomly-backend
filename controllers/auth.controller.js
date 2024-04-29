const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { Token } = require('../models/token.model');
const { User } = require('../models/user.model');
const { config } = require('../config/config');
const mailSender = require('../helpers/emailSender.helper');
const { accessTokenSecret, refreshTokenSecret } = config;

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));
    return res.status(400).json({ errors: errorMessages });
  }
  try {
    let user = new User({
      ...req.body,
      passwordHash: bcrypt.hashSync(req.body.password, 8),
    });
    user = await user.save();
    if (!user) {
      res.status(500).json({
        type: 'Internal Server Error',
        message: 'Could not create a new user.'
      });
    }
    return res.status(201).json(user);

  } catch (error) {
    if (error.message.includes('email_1 dup key')) {
      return res.status(409).json({
        type: 'AuthError',
        message: 'User with that email alredy exists.',
      });
    }
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Check your email and try again.' });
    }
    if (!bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(400).json({ message: 'Incorrect Password!' });
    }
    const accessToken = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      accessTokenSecret,
      { expiresIn: '24h' },
    );
    const refreshToken = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      refreshTokenSecret,
      { expiresIn: '60d' },
    );

    const token = await Token.findOne({ userId: user.id });
    if (token) await token.deleteOne();

    await new Token({ userId: user.id, accessToken, refreshToken }).save();
    user.passwordHash = undefined;
    return res.json({ ...user._doc, accessToken });

  } catch (error) {
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
}

const verifyToken = async (req, res) => {
  try {
    let accessToken = req.headers.authorization;
    if (!accessToken) return res.json(false);
    accessToken = accessToken.replace('Bearer', '').trim();

    const token = await Token.findOne({ accessToken });
    if (!token) return res.json(false);

    const tokenData = jwt.decode(token.refreshToken);

    const user = await User.findById(tokenData.id);
    if (!user) return res.json(false);

    const isValid = jwt.verify(token.refreshToken, config.refreshTokenSecret);
    if (!isValid) return res.json(false);
    return res.json(true);

  } catch (error) {
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
}

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with that email does NOT exists!' });
    }
    const otp = Math.floor(1000 + Math.random() * 9000);
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpired = Date.now() + 300000;
    await user.save();

    const response = await mailSender.sendMail(
      email,
      'Password reset One-Time Password.',
      `Your One-Time Password for password reset is ${otp}.`
    );
    return res.json({ message: response });

  } catch (error) {
    return res.status(500).json({
      type: error.name,
      message: error.message
    });
  }
}

const verifyPasswordResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }
    if (user.resetPasswordOtp !== +otp) {
      return res.status(401).json({ message: 'Invalid One-Time Password.' });
    }
    if (Date.now() > user.resetPasswordOtpExpired) {
      return res.status(401).json({ message: 'Expired One-Time Password.' });
    }

    user.resetPasswordOtp = 1;
    user.resetPasswordOtpExpired = undefined;
    user.save();
    return res.status(200).json({ message: 'One-Time Password confirmed successfully.' });

  } catch (error) {
    return res.status(500).json({
      type: error.name,
      message: error.message
    });
  }
}

const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));
    return res.status(400).json({ errors: errorMessages });
  }
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }
    if (user.resetPasswordOtp !== 1) {
      return res.status(401).json({ message: 'Confirm One-Time Password before resetting the password.' })
    }

    user.passwordHash = bcrypt.hashSync(newPassword, 8);
    user.resetPasswordOtp = undefined;
    await user.save();
    return res.status(200).json({ message: 'Password reset successfully.' });

  } catch (error) {
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
}

module.exports = { register, login, forgotPassword, verifyPasswordResetOTP, resetPassword, verifyToken };