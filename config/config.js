require('dotenv/config');

const env = process.env;

const config = {
  hostname: env.HOSTNAME,
  port: env.PORT,
  mongodbConectionString: env.MONGODB_CONECTION_STRING,
  accessTokenSecret: env.ACCESS_TOKEN_SECRET,
  refreshTokenSecret: env.REFRESH_TOKEN_SECRET,
  emailAddress: env.EMAIL_ADDRESS,
  emailAppPassword: env.EMAIL_APP_PASSWORD,
};

module.exports = { config };