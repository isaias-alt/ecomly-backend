const jwt = require('jsonwebtoken');
const { Token } = require('../models/token.model');
const { User } = require('../models/user.model');
const { config } = require('../config/config');
const { accessTokenSecret, refreshTokenSecret } = config;

const errorHandler = async (error, req, res, next) => {
  if (error.name === 'UnauthorizedError') {
    if (!error.message.includes('jwt expired')) {
      return res.status(error.status).json({
        type: error.name,
        message: error.message,
        code: error.status,
      });
    }

    try {
      const tokenHeader = req.header('Authorization');
      const accessToken = tokenHeader?.split(' ')[1];
      const token = await Token.findOne({
        accessToken,
        refreshToken: { $exists: true }
      });

      if (!token) {
        return res.status(401).json({
          type: 'Unauthorized',
          message: 'Token does not exist.',
          code: 401
        });
      }

      const userData = jwt.verify(token.refreshToken, refreshTokenSecret);
      const user = await User.findById(userData.id);
      if (!user) {
        return res.status(404).json({
          message: 'Invalid user!',
          code: 404
        });
      }

      const newAccessToken = jwt.sign(
        { id: user.id, isAdmin: user.isAdmin },
        accessTokenSecret,
        { expiresIn: '24h' }
      );

      req.headers['authorization'] = `Bearer ${newAccessToken}`;
      await Token.updateOne(
        { _id: token.id },
        { accessToken: newAccessToken }
      ).exec();
      res.set('Authorization', `Bearer ${newAccessToken}`);

      return next();

    } catch (refreshError) {
      return res.status(401).json({
        type: 'Unauthorized',
        message: refreshError.message,
        code: 401
      });
    }
  }

  return res.status(400).json({
    type: error.name,
    message: error.message,
    code: error.status,
  });
}

module.exports = { errorHandler };