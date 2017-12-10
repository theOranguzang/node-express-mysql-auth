'use strict';

const db = require('../../db/index');
const joi = require('joi');
const fp = require('lodash/fp');

const tableName = 'users';

const read_params_schema = joi.object({
  user_id: joi.number().integer(),
  user_name: joi.string()
}).xor('user_id', 'user_name').required();

async function read(params) {
  const readParams = joi.attempt(params, read_params_schema);
  return db(tableName).select().where(readParams).then(fp.first);
}

const insert_params_schema = joi.object({
  user_id: joi.number().integer(),
  user_name: joi.string().required(),
  password: joi.string().required()
}).required();

async function insert(params) {
  const insertParams = joi.attempt(params, insert_params_schema);
  return db(tableName).insert(insertParams).then(fp.first);
}

const update_params_schema = joi.object({
  user_id: joi.number().integer().required(),
  user_name: joi.string(),
  password: joi.string()
}).required();

const update_column_params_schema = joi.object({
  user_name: joi.string(),
  password: joi.string()
}).or('user_name', 'password').required();

//this updates a user entry. takes in user object.
async function update(params) {
  const updateParams = joi.attempt(params, update_params_schema);
  const updateColumnParams = joi.validate(params, update_column_params_schema, {stripUnknown: true});
  if (updateColumnParams.error) throw updateColumnParams.error;
  return db(tableName).update(updateColumnParams.value).where({ user_id: updateParams.user_id });
}

module.exports = {
  read, insert, update, tableName
}
