const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

const { config } = require('./config/config');
const { authJwt } = require('./middleware/jwt.handler');
const { errorHandler } = require('./middleware/error.handler');
const { hostname, port, mongodbConectionString } = config;
const routerApi = require('./routes/index');

const app = express();

app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cors());
app.options('*', cors());
app.use(authJwt());
app.use(errorHandler);

app.use('/api', routerApi);
app.use('/public', express.static(__dirname + '/public'));

mongoose.connect(mongodbConectionString).then(() => {
  console.log('Connected to Database');
}).catch((error) => {
  console.error(error);
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}`);
});