const express = require('express');
const routerApi = express.Router();

const authRouter = require('./auth.router');
const usersRouter = require('./users.router');
const adminRouter = require('./admin.router');
const router = require('./auth.router');

routerApi.use('/auth', authRouter);
routerApi.use('/users', usersRouter);
routerApi.use('/admin', adminRouter);

module.exports = routerApi;