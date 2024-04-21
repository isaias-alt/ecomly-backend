const nodemailer = require('nodemailer');
const { config } = require('../config/config');
const { emailAddress, emailAppPassword } = config;

const sendMail = async (email, subject, body) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      service: 'Gmail',
      auth: {
        user: emailAddress,
        pass: emailAppPassword,
      }
    });

    const mailOptions = {
      from: emailAddress,
      to: email,
      subject: subject,
      text: body,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(Error('Error sending email.'));
      }
      resolve('Password reset OPT sent to your email');
    });
  });
}

module.exports = { sendMail };