'use strict';

var express = require('express');
var router = express.Router();
var user = require('../services/user/user');
var argon = require('argon2');
const { expect } = require('chai');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

module.exports = (app) => {
  /** Non-session routes! */
  app.post('/authenticateNativeUser', async (req, res) => {
    if (req.query.name
      && req.query.password) {
      const searchUser = await user.read({ user_name: req.query.name });
      if (searchUser) {
        try {
          if (await argon.verify(searchUser.password, req.query.password)) {
            //don't ever send personalized user info in our tokens.
            //use user_id, it's there for a reason.
            const payload = _.omit(searchUser, ['user_name', 'password']);
            const token = jwt.sign(payload, app.get('superSecret'), {
              expiresIn: '24h'
            });
            res.json({ success: true, token: token });
          } else {
            res.status(500).send({
              error: 'Authentication failed. Wrong password!'
            });
          }
        } catch (err) {
          res.status(500).send({ error: err });
        }
      } else {
        res.status(500).send({ error: 'Authentication failed. User not found!' });
      }
    } else {
      if (req.query.name) res.status(500).send({ error: 'Missing password!' });
      else res.status(500).send({ error: 'Missing name!' });
    }
  });

  app.post('/registerNativeUser', async (req, res) => {
    if (req.query.name
      && req.query.password) {
      const searchUser = await user.read({ user_name: req.query.name });
      if (searchUser) {
        res.status(500).send({ error: 'User already exists!' });
      } else {
        const hash = await argon.hash(req.query.password);
        const userIdReturned = await user.insert({
          user_name: req.query.name,
          password: hash
        });
        var userReturned = await user.read({ user_id: userIdReturned });
        userReturned = _.omit(userReturned, ['password']);
        res.json({ success: true, user: userReturned });
      }
    } else {
      if (req.query.name) res.status(500).send({ error: 'Missing password!' });
      else res.status(500).send({ error: 'Missing name!' });
    }
  });

  app.post('/checkForUserNameUniqueness', (req, res) => {
    //
  });

  /** Session-secured routes! */

  //for unit tests
  app.get('/testTokenCall', async (req, res) => {
    expect(req.token).to.exist;
    if (req.token) res.json({ success: true });
    else res.status(500).send({ error: 'Missing token!' });
  });

  app.post('/updateNativeUser', async (req, res) => {
    if (req.token) {
      if (req.query.user) {
        try {
          const updateResult = await user.update(req.query.user);
          if (updateResult) res.json({ success: true });
          else res.status(500).send({ error: 'Internal Server Error!' });
        } catch (err) {
          res.status(500).send({ error: err });
        }
      }
    } else res.status(500).send({ error: 'Missing token!' });
  });
};

