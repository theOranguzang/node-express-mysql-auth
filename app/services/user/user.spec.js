'use strict';

const { expect } = require('chai');
const db = require('../../db/index');
const _ = require('lodash');
const userService = require('./user');

describe('User Service', () => {
  let id;
  let userToInsert;
  beforeEach(async () => {
    id = _.random(1000) + 10000; //random id between 1000 and 11000
    userToInsert = {
      user_id: id,
      user_name: 'random_ass_user',
      password: 'random_ass_password'
    };
  });
  afterEach(async () => {
    await db(userService.tableName).where({ user_id: id }).delete();
  });
  describe('.insert', () => {
    it('should insert dummy db entry', async () => {
      const userIdReturned = await userService.insert(userToInsert);
      const userInDB = await db(userService.tableName).where({ user_id: id }).first();
      expect(userInDB).to.eql(userToInsert);
      expect(userIdReturned).to.eql(userToInsert.user_id);
    });
    it('should validate the input params', async() => {
      delete userToInsert.login;
      try {
        await userService.insert(userToInsert);
      } catch (err) {
        expect(err.name).to.be.sql('ValidationError');
      }
    })
  });
  describe('.read', () => {
    it('should return a user', async () => {
      await db(userService.tableName).insert(userToInsert);
      const userReturned = await userService.read({ user_id: id });
      expect(userReturned);
      expect(userReturned).to.eql(userToInsert);
    });
    it('should return undefined if user not found', async () => {
      const result = await userService.read({ user_id: id });
      expect(result).to.eql(undefined);
    });
  });
  describe('.update', () => {
    it('should update dummy db entry', async () => {
      const userIdReturned = await userService.insert(userToInsert);
      userToInsert.password = 'changed password is this!';
      const result = await userService.update(userToInsert);
      const getUser = await userService.read({ user_id: id });
      expect(result).to.eql(1);
      expect(getUser).to.eql(userToInsert);
    });
    it('should validate the input params', async () => {
      const userIdReturned = await userService.insert(userToInsert);
      delete userToInsert.password;
      delete userToInsert.user_name;
      try {
        const result = await userService.update(userToInsert);
      } catch (err) {
        expect(err.name).to.be.eql('ValidationError');
      }
    });
  });
});
