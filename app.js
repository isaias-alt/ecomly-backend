const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

const { config } = require('./config/config');
const authRouter = require('./routes/auth.router');
const usersRouter = require('./routes/users.router');
const adminRouter = require('./routes/admin.router');
const { authJwt } = require('./middleware/jwt.handler');
const { errorHandler } = require('./middleware/error.handler');
const { hostname, port, mongodbConectionString } = config;

const app = express();

app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cors());
app.options('*', cors());
app.use(authJwt());
app.use(errorHandler);

app.use(authRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);

mongoose.connect(mongodbConectionString).then(() => {
  console.log('Connected to Database');
}).catch((error) => {
  console.error(error);
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}`);
});