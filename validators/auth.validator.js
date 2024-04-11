const { body } = require('express-validator');

const validateUser = [
  body('name').not().isEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('Please enter a valid email address.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .isStrongPassword().withMessage('Password must be at least one uppercase, one lowercase and one symbol.'),
  body('phone').isMobilePhone().withMessage('Please enter a valid phone number'),
];

const validatePassword = [
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .isStrongPassword().withMessage('Password must be at least one uppercase, one lowercase and one symbol.'),
];

module.exports = { validateUser, validatePassword };