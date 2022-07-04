process.env.DB_DATABASE = process.env.DB_DATABASE || 'shareamealtestdb'
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');


require('dotenv').config()
const dbconnection = require('../../src/database/dbconnection');



const jwt = require('jsonwebtoken');
const { jwtSecretKey, logger } = require('../../src/config/config');


chai.should();
chai.expect();
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE


  const INSERT_USER =
  'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
  '(1, "John", "Doe", "johndoe@server.com", "Testing193!", "Lovensdijkstraat", "Breda") , (2, "Henk", "Doe", "Henk@server.com", "Testing193!", "Lovensdijkstraat", "Breda") , (3, "John", "Doe", "johndoe1@server.com", "Testing193!", "Lovensdijkstraat", "Breda");'



describe('Manage users /api/user', () => {
  beforeEach((done) => {
    dbconnection.getConnection(function (err, connection) {
      if (err) next(err); // not connected!

      // Use the connection
      connection.query(
        CLEAR_DB + INSERT_USER,
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();
          if (err) next(err);

          done();
        });
    });
  });

  describe('UC-201 Create user', () => {
    it('TC-201-1 Mandatory field is missing', (done) => {
      let user = {
        // firstName: "John", 
        lastName: "Test",
        street: "Teststraat",
        city: "Breda",
        emailAdress: "test@server.com",
        password: "Testing193!",
        phoneNumber: "0612345678",
      }
      chai.request(server)
        .post('/api/user')
        .send(user)
        .end((err, res) => {
          res.body.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a('string').that.equals('firstName must be a string');
          done();
        });
    });


    it('TC-201-2 Non-valid email address', (done) => {
      let user = {
        firstName: "John",
        lastName: "Test",
        street: "Teststraat",
        city: "Breda",
        emailAdress: "fakeEmail",
        password: "Testing193!",
        phoneNumber: "0612345678",
      }
      chai.request(server)
        .post('/api/user')
        .send(user)
        .end((err, res) => {
          res.body.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a('string').that.equals('Email must be valid');
          done();
        })
    });


    it('TC-201-3  Non-valid password', (done) => {
      let user = {
        firstName: "John",
        lastName: "Test",
        street: "Teststraat",
        city: "Breda",
        emailAdress: "test@server.com",
        password: "ab",
        phoneNumber: "0612345678",
      }
      chai.request(server)
        .post('/api/user')
        .send(user)
        .end((err, res) => {
          res.body.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(400)
          message.should.be.a('string').that.equals('Password must be valid');
          done();
        });
    });

    it('TC-201-4  User already exists', (done) => {
      let user = {
        firstName: "John",
        lastName: "Doe",
        street: "Lovensdijkstraat",
        city: "Breda",
        emailAdress: "johndoe@server.com",
        password: "Testing193!",
        phoneNumber: "0612345678",
      }

      chai.request(server)
        .post('/api/user')
        .send(user)
        .end((err, res) => {
          res.body.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(409)
          message.should.be.a('string').that.equals('EmailAdress already in use');
          done();
        })
    });


    it('TC-201-5  User successfully registered', (done) => {
      let user = {
        id: "87979",
        firstName: "Johnny",
        lastName: "Tester",
        street: "Teststraat",
        city: "Breda",
        emailAdress: "johnny1@server.com",
        password: "Secret123!",
        phoneNumber: "0612345678",
      }
      chai.request(server)
        .post('/api/user')
        .send(user)
        .end((err, res) => {
          res.body.should.be.an('object');
          let { status, result } = res.body;
          status.should.equals(201)
          result.id.should.equals(user.id)
          done();
        });
    });
  });


  describe('UC-202 get all users', () => {
    it('TC-202-1 Show zero users', (done) => {
      dbconnection.getConnection(function (err, connection) {
        if (err) next(err);
        connection.query(CLEAR_DB, function (error, results, fields) {
          connection.release()
          if (err) next(err);
        });
      });
      chai.request(server)
        .get('/api/user?firstName=unkown')
        .set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equals(200)
          result.should.be.a('array');
          result.length.should.be.equals(0);
        });

      dbconnection.getConnection(function (err, connection) {
        if (err) next(err);
        connection.query(INSERT_USER, function (error, results, fields) {
          connection.release()
          if (err) next(err);
          done();
        }
        )
      })
    });

    it('TC-202-2 Show two users', (done) => {
      chai.request(server)
        .get('/api/user?firstName=John')
        .set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equals(200)
          result.should.be.a('array');
          result.length.should.be.equals(2);
          done();
        });
    });

    it('TC-202-3 Show users with search term on non-existent name', (done) => {
      chai.request(server)
        .get('/api/user?firstName=onbekend')
        .set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equals(200)
          result.should.be.a('array');
          result.length.should.be.equals(0);
          done();
        });
    });

    it('TC-202-4 Show users using the search term isActive = false', (done) => {
      chai.request(server)
        .get('/api/user?isActive=false')
        .set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equals(200)
          result.should.be.a('array');
          result.length.should.be.equals(0);
          done();
        });
    });

    it('TC-202-5 Show users using the search term isActive = true', (done) => {
      chai.request(server)
        .get('/api/user?isActive=true')
        .set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equals(200)
          result.should.be.a('array');
          result.length.should.be.equals(3);
          done();
        });
    });

    it('TC-202-6 Show users with search term on existing name', (done) => {
      chai.request(server)
        .get('/api/user?firstName=John')
        .set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equals(200)
          result.should.be.a('array');
          result.length.should.be.equals(2);
          done();
        });
    });
  });

  describe('UC-203 Request user profile', () => {
    it('TC-203-1 Invalid token', (done) => {
      chai.request(server)
        .get('/api/user/profile')
        .set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey + 'invalid')) // invalid token 
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(401)
          message.should.be.a('string').that.equals('Not authorized/Invalid token.')
          done();
        });
    });

    it('TC-203-2 Valid token and user exists.', (done) => {
      chai.request(server)
        .get('/api/user/profile')
        .set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equals(200)
          result.should.be.a('object');
          result.should.have.property('id');
          result.should.have.property('firstName');
          result.should.have.property('lastName');
          result.should.have.property('emailAdress');
          result.should.have.property('phoneNumber');
          result.should.have.property('roles');
          result.should.have.property('street');
          result.should.have.property('city');
          result.should.have.property('isActive');
          done();
        });
    });
  });

  describe('UC-204 Details of user', () => {
    it('TC-204-1 Invalid token', (done) => {
      chai.request(server)
        .get('/api/user/1')
        .set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey + "invalid")) // invalid token
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(401)
          message.should.be.a('string').that.equals('Not authorized/Invalid token.')
          done();
        });
    });

    it('TC-204-2 User id does not exist', (done) => {
      chai.request(server)
        .get('/api/user/53874') // user with this id does not exist
        .set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(404)
          message.should.be.a('string').that.equals('User not found!')
          done();
        });
    });

    it('TC-204-3 User id does exist', (done) => {
      chai.request(server)
        .get('/api/user/1')
        .set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equals(200)
          result.should.be.a('object');
          result.should.have.property('id');
          result.should.have.property('firstName');
          result.should.have.property('lastName');
          result.should.have.property('emailAdress');
          result.should.have.property('phoneNumber');
          result.should.have.property('roles');
          result.should.have.property('street');
          result.should.have.property('city');
          result.should.have.property('isActive');
          done();
        });
    });
  });

  describe('UC-205 Updateuser', () => {
    it('TC-205-1 Mandatory field "emailAdress" is missing', (done) => {
      let user = {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        street: "Lovensdijkstraat",
        city: "Breda",
        phoneNumber: "0612345678",
        //emailAdress: "johndoe@server.com", email missing
        password: "Testing193!",
      }
      chai.request(server)
        .put('/api/user/1')
        .set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send(user)
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(400)
          message.should.be.a('string').that.equals('emailAdress must be a string')
          done();
        });
    });

    it('TC-205-3 Non-valid phone number', (done) => {
      let user = {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        street: "Lovensdijkstraat",
        city: "Breda",
        phoneNumber: "123",
        emailAdress: "johndoe@server.com",
        password: "Testing193!",
      }
      chai.request(server)
        .put('/api/user/1')
        .set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send(user)
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(400)
          message.should.be.a('string').that.equals('phoneNumber must be valid')
          done();
        });
    });

    it('TC-205-4 User does not exist', (done) => {
      let user = {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        street: "Lovensdijkstraat",
        city: "Breda",
        phoneNumber: "0612345678",
        emailAdress: "johndoe@server.com",
        password: "Testing193!",
      }
      chai.request(server)
        .put('/api/user/0') // user with this id does not exist
        .set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send(user)
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(400)
          message.should.be.a('string').that.equals('User does not exist')
          done();
        });
    });

    it('TC-205-5 Not logged in', (done) => {
      let user = {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        street: "Lovensdijkstraat",
        city: "Breda",
        phoneNumber: "0612345678",
        emailAdress: "johndoe@server.com",
        password: "Testing193!",
      }
      chai.request(server)
        .put('/api/user/1')
        //.set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)) authorization missing
        .send(user)
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(401)
          message.should.be.a('string').that.equals('Authorization header missing!')
          done();
        });
    });

    it('TC-205-6 User successfully updated', (done) => {
      let user = {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        street: "Lovensdijkstraat",
        city: "Breda",
        phoneNumber: "0612345678",
        emailAdress: "johndoe@server.com",
        password: "Testing193!",
      }

      chai.request(server)
        .put('/api/user/1')
        .set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .send(user)
        .end((err, res) => {
          let { status, result } = res.body;
          status.should.eql(200);
          result.should.have.property('id');
          result.should.have.property('lastName');
          result.should.have.property('isActive');
          result.should.have.property('emailAdress');
          result.should.have.property('phoneNumber');
          result.should.have.property('roles');
          result.should.have.property('street');
          result.should.have.property('city');
          done();
        });
    });
  });

  describe('UC-206 Delete user', () => {
    it('TC-206-1 User does not exist', (done) => {
      chai.request(server)
        .delete('/api/user/9859') // user with this id does not exist
        .set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(400)
          message.should.be.a('string').that.equals('User does not exist');
          done();
        });
    });

    it('TC-206-2 User not logged in', (done) => {
      chai.request(server)
        .delete('/api/user/1')
        //.set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)) 
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(401)
          message.should.be.a('string').that.equals('Authorization header missing!');
          done();
        });
    });

    it('TC-206-3 Actor is not owner', (done) => {
      chai.request(server)
        .delete('/api/user/3')
        .set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(403)
          message.should.be.a('string').that.equals('User not allowed to delete this user');
          done();
        });
    });

    it('TC-206-4 User deleted succesfully', (done) => {
      chai.request(server)
        .delete('/api/user/1')
        .set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.a("array");
          done();
        });
    });

    after((done) => {
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err // not connected!
        // Use the connection
        connection.query(
          CLEAR_DB + INSERT_USER,
          function (error, results, fields) {
            // When done with the connection, release it.
            connection.release()
            if (error) throw error
            done()
          });
      });
    });
  });
});






