'use strict';

const request = require('super-request');
const server = require('../index');
const { expect } = require('chai');
const userService = require('../services/user/user')
const db = require('../db/index');

describe('testing authentication routes without authentication:', () => {

  it('POST /registerNativeUser', async() => {
    //try once, should register
    const { body } = await request(server.listen())
      .post('/registerNativeUser')
      .qs({ name: 'dummy_username_name', password: 'password' })
      .expect(200)
      .end((err, res, body) => {
        if (err) console.log(err);
        const bodyJson = JSON.parse(body);
        expect(bodyJson.success).to.be.eql(true);
        expect(bodyJson.user.user_name).to.be.eql("dummy_username_name");
      });
      //try again, should fail
    const { body2 } = await request(server.listen())
      .post('/registerNativeUser')
      .qs({ name: 'dummy_username_name', password: 'password' })
      .expect(500)
      .end((err, res, body) => {
        if (err) console.log(err);
        const bodyJson = JSON.parse(body);
        expect(bodyJson.error).to.be.eql('User already exists!');
      });
  });

  it('POST /authenticateNativeUser', async () => {
    const { body } = await request(server.listen())
      .post('/authenticateNativeUser')
      .qs({ name: 'dummy_username_name', password: 'password' })
      .expect(200)
      .end((err, res, body) => {
        if (err) console.log(err);
        const bodyJson = JSON.parse(body);
        expect(bodyJson.success).to.be.eql(true);
        expect(bodyJson.token).to.exist;
      });
  });

  after(async () => {
    const userReturned = await userService.read({ user_name: 'dummy_username_name' });
    if (userReturned) {
      await db(userService.tableName).where({ user_id: userReturned.user_id }).delete();
    }
  });
});

describe('testing secure routes after authentication:', () => {
  let token;
  let user;
  before(async () => {
    //register
    await request(server.listen())
      .post('/registerNativeUser')
      .qs({ name: 'dummy_username_name', password: 'password' })
      .expect(200)
      .end((err, res, body) => {
        if (err) console.log(err);
        if (body) {
          const bodyJson = JSON.parse(body);
          expect(bodyJson.success).to.be.eql(true);
          expect(bodyJson.user.user_name).to.be.eql("dummy_username_name");
          user = bodyJson.user;
        }
      });
    //authenticate
    await request(server.listen())
      .post('/authenticateNativeUser')
      .qs({ name: 'dummy_username_name', password: 'password' })
      .expect(200)
      .end((err, res, body) => {
        if (err) console.log(err);
        const bodyJson = JSON.parse(body);
        if (body) {
          expect(bodyJson.success).to.be.eql(true);
          expect(bodyJson.token).to.exist;
          token = bodyJson.token;
        }
      });
  });

  it('GET /testTokenCall', async () => {
    await request(server.listen())
      .get('/testTokenCall')
      .headers({ 'x-access-token': token })
      .expect(200)
      .end((err, res, body) => {
        if (err) console.log(err);
        if (body) {
          const bodyJson = JSON.parse(body);
          expect(bodyJson.success).to.be.eql(true);
        }
      });
  });

  it('POST /updateNativeUser', async () => {
    user.password = 'changed_password';
    await request(server.listen())
      .post('/updateNativeUser')
      .qs({
        token: token,
        user: user
      })
      .expect(200)
      .end((err, res, body) => {
        if (err) console.log(err);
        if (body) {
          const bodyJson = JSON.parse(body);
          expect(bodyJson.success).to.be.eql(true);
        }
      });
  });

  after(async () => {
    const userReturned = await userService.read({ user_name: 'dummy_username_name' });
    if (userReturned) {
      await db(userService.tableName).where({ user_id: userReturned.user_id }).delete();
    }
  });
})
