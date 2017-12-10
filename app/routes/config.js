'use strict';

var express = require('express');
var router = express.Router();
const _ = require('lodash');
const jwt = require('jsonwebtoken');

const nonSecurePaths = [
  '/',
  '/authenticateNativeUser',
  '/registerNativeUser',
  '/checkForUserNameUniqueness'
];

module.exports = (app) => {
  router.use(async (req, res, next) => {
    if (_.includes(nonSecurePaths, req.path)) return next();
    //call jws.verifyToken here!
    const token = req.body.token || req.query.token || req.headers['x-access-token'];
    //continue if accepted, or reject if bad/missing token
    if (token) {
      jwt.verify(token, app.get('superSecret'), (err, decoded) => {
        if (err) {
          return res.json({ success: false, message: 'Failed to authenticate token' });
        } else {
          req.token = decoded;
          next();
        }
      });
    } else {
      return res.status(403).send({
        success: false,
        message: 'No token provided.'
      });
    }
  });
  app.use(router);
}
