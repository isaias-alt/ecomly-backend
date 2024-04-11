const { expressjwt: expjwt } = require('express-jwt');
const { Token } = require('../models/token.model');
const { config } = require('../config/config');
const { accessTokenSecret } = config;

const authJwt = () => {
  return expjwt({
    secret: accessTokenSecret,
    algorithms: ['HS256'],
    isRevoked: isRevoked,
  }).unless({
    path: [
      '/login',
      '/login/',

      '/register',
      '/register/',

      '/forgot-password',
      '/forgot-password/',

      '/reset-password',
      '/reset-password/'
    ],
  });
}

const isRevoked = async (req, jwt) => {
  const auth = req.header('Authorization')
  if (!auth.startsWith('Bearer ')) {
    return true;
  }

  const accessToken = auth.replace('Bearer', '').trim();
  const token = await Token.findOne({ accessToken });

  const adminRouteRegex = /^\/admin\//i;
  const adminFault = !jwt.payload.isAdmin && adminRouteRegex.test(req.originalUrl);

  return adminFault || !token;
}

module.exports = { authJwt };