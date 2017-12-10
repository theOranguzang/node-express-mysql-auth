'use strict';

var dbConfig = require('../db/config');
const knex = require('knex');
const db = knex({
  client: 'mysql',
  connection: {
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database
  },
  // pool: {
  //   min: dbConfig.pool_min, 
  //   max: dbConfig.pool_max
  // }
});
module.exports = db;
