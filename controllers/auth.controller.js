const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { Token } = require('../models/token.model');
const { User } = require('../models/user.model');
const { config } = require('../config/config');
const mailSender = require('../helpers/email.helper');
const { accessTokenSecret, refreshTokenSecret } = config;

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));
    return res.status(400).json({
      errors: errorMessages,
      code: 400
    });
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
        message: 'Could not create a new user.',
        code: 500
      });
    }
    return res.status(201).json(user);

  } catch (error) {
    console.error(error);
    if (error.message.includes('email_1 dup key')) {
      return res.status(409).json({
        type: 'AuthError',
        message: 'User with that email alredy exists.',
        code: 409
      });
    }
    return res.status(500).json({
      type: error.name,
      message: error.message,
      code: 500
    });
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        message: 'User not found. Check your email and try again.',
        code: 404
      });
    }
    if (!bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(400).json({
        message: 'Incorrect Password!',
        code: 400
      });
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
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
      code: 500
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
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
      code: 500
    });
  }
}

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: 'User with that email does NOT exists!',
        code: 404
      });
    }
    const otp = Math.floor(1000 + Math.random() * 9000);
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpired = Date.now() + 300000;
    await user.save();

    const response = await mailSender.sendMail(
      email,
      'Password reset OTP.',
      `Your OTP for password reset is ${otp}.`
    );
    return res.json({ message: response });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
      code: 500
    });
  }
}

const verifyPasswordResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: 'User not found!',
        code: 404,
      });
    }
    if (user.resetPasswordOtp !== +otp) {
      return res.status(401).json({
        message: 'Invalid OTP.',
        code: 401
      });
    }
    if (Date.now() > user.resetPasswordOtpExpired) {
      return res.status(401).json({
        message: 'Expired OTP.',
        code: 401
      });
    }

    user.resetPasswordOtp = 1;
    user.resetPasswordOtpExpired = undefined;
    user.save();
    return res.status(200).json({
      message: 'OTP confirmed successfully.',
      code: 200
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
      code: 500
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
    return res.status(400).json({
      errors: errorMessages,
      code: 400
    });
  }
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: 'User not found!',
        code: 404,
      });
    }
    if (user.resetPasswordOtp !== 1) {
      return res.status(401).json({
        message: 'Confirm OTP before resetting the password.',
        code: 401
      })
    }

    user.passwordHash = bcrypt.hashSync(newPassword, 8);
    user.resetPasswordOtp = undefined;
    await user.save();
    return res.status(200).json({
      message: 'Password reset successfully.',
      code: 200
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
      code: 500
    });
  }
}

module.exports = { register, login, forgotPassword, verifyPasswordResetOTP, resetPassword, verifyToken };