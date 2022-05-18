const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const assert = require('assert');
require('dotenv').config()
const dbconnection = require('../../database/dbconnection');
const { doesNotMatch } = require('assert');

chai.should();
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE


const INSERT_USER =
  'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
  '(1, "John", "Doe", "j.doe@server.com", "secret", "Lovensdijkstraat", "Breda");'

describe('Manage users /api/user', () => {
  beforeEach((done) => {
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err // not connected!

      // Use the connection
      connection.query(
        CLEAR_DB + INSERT_USER,
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release()

          // Handle error after the release.
          if (error) throw error
          // Let op dat je done() pas aanroept als de query callback eindigt!
          done()
        }
      )
    })
  })

  describe('UC-201 Create user', () => {

    it.skip('TC-201-1 Verplicht veld ontbreekt', (done) => {
      let user = {
        firstName: "John",
        lastName: "Test",
        street: "Teststraat",
        city: "Breda",
        isActive: "true",
        emailAdress: "test@server.com",
        password: "secret",
        phoneNumber: "06 12425475"
      }
      chai.request(server)
        .post('/api/user')
        .send(user)
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(400)
          message.should.be.a('string').that.equals('firstName must be a string');
          done();
        });
    });

   

    it.skip('TC-201-2 Niet-valide emailadres', (done) => {
      let user = {
        firstName: "John",
        lastName: "Test",
        street: "Teststraat",
        city: "Breda",
        isActive: "true",
        emailAdress: "fakeEmail",
        password: "secret",
        phoneNumber: "06 12425475"
      }
      chai.request(server)
      .post('api/user')
      .send(user)
      .end((err, res) => {
        res.should.be.an('object');
        let { status, message } = res.body;
        status.should.equals(400);
        message.should.be.a('string').that.equals('Enter valid emailadres');
      })
    });

    it('TC-201-3  Niet-valide wachtwoord', (done) => {
      let user = {
        firstName: "John",
        lastName: "Test",
        street: "Teststraat",
        city: "Breda",
        isActive: "true",
        emailAdress: "test@server.com",
        password: "ab",
        phoneNumber: "06 12425475"
      }
      chai.request(server)
        .post('/api/user')
        .send(user)
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(400)
          message.should.be.a('string').that.equals('Password must be valid');
          done();
        });
    });

    it('TC-201-4  Gebruiker bestaat al', (done) => {
      let user = {
        firstName: "John",
        lastName: "Test",
        street: "Teststraat",
        city: "Breda",
        isActive: "true",
        emailAdress: "test@server.com",
        password: "ab",
        phoneNumber: "06 12425475"
      }
      chai.request(server)
        .post('/api/user')
        .send(user)
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(409)
          message.should.be.a('string').that.equals('User already excists with current e-mail address');
          done();
        });
    });

    it('TC-201-5  Gebruiker succesvol geregistreerd', (done) => {
      let user = {
        firstName: "Johnny",
        lastName: "Tester",
        street: "Teststraat 15",
        city: "Breda",
        emailAdress: "johnny@server.com",
        password: "secret",
      }
      chai.request(server)
        .post('/api/user')
        .send(user)
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equals(201)
          message.should.be.a('array');
          done();
        });
    });

    





  });
});

