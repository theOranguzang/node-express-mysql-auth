'use strict';

var express = require('express');
var helmet = require('helmet');
var app = express();
var bodyParser = require('body-parser');
var helmet = require('helmet');
var secret = require('./config');

//any middleware references go here!

app.set('superSecret', secret);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet());
require('./routes/config')(app);

//express route files here!
require('./routes/auth')(app);

app.get('/', (req, res) => {
  res.send('Hello!~ Welcome to Auth API!');
});

module.exports = app;
