const express = require('express');
const router = express.Router();

const usersController = require('../controllers/users.controller');

router.get('/', usersController.getUsers);

router.get('/:id', usersController.getUserById);

router.put('/:id', usersController.updateUser);


module.exports = router;