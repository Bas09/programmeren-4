const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');

require('dotenv').config()
const dbconnection = require('../../src/database/dbconnection');
const { doesNotMatch } = require('assert');

chai.should();
chai.use(chaiHttp);

const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE


const INSERT_USER =
  'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
  '(1, "John", "Doe", "johndoe@server.com", "secret", "Lovensdijkstraat", "Breda");'



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

          if (error) throw error
          

          done()
        }
      )
    })
  })

  describe('UC-201 Create user', () => {

    it('TC-201-1 Verplicht veld ontbreekt', (done) => {
      let user = {
        // firstName: "John",
        lastName: "Test",
        street: "Teststraat",
        city: "Breda",
        emailAdress: "test@server.com",
        password: "Testing193!",

      }
      chai.request(server)
        .post('/api/user')
        .send(user)
        .end((err, res) => {
          res.body.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(400)
          message.should.be.a('string').that.equals('firstName must be a string');
          done();
        });
    });


    it('TC-201-2 Niet-valide emailadres', (done) => {
      let user = {
        firstName: "John",
        lastName: "Test",
        street: "Teststraat",
        city: "Breda",
        emailAdress: "fakeEmail",
        password: "Testing193!"
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



    it('TC-201-3  Niet-valide wachtwoord', (done) => {
      let user = {
        firstName: "John",
        lastName: "Test",
        street: "Teststraat",
        city: "Breda",
        emailAdress: "test@server.com",
        password: "ab",
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

    it('TC-201-4  Gebruiker bestaat al', (done) => { //not working jet end in index.js with error 401
      let user = {
        firstName: "John",
        lastName: "Doe",
        street: "Lovensdijkstraat",
        city: "Breda",
        emailAdress: "johndoe@server.com",
        password: "Testing193!",
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

    

    it('TC-201-5  Gebruiker succesvol geregistreerd', (done) => {
      let user = {
        firstName: "Johnny",
        lastName: "Tester",
        street: "Teststraat",
        city: "Breda",
        emailAdress: "johnny1@server.com",
        password: "Secret123!",
      }
      chai.request(server)
        .post('/api/user')
        .send(user)
        .end((err, res) => {
          res.body.should.be.an('object');
          let { status, /*result*/ } = res.body;
          status.should.equals(201)
          // result.should.be.a('array');
          done();
        });
    });
  });


  describe('UC-202 get all users', () => {
    it.skip('TC-202-1 Toon nul gebruikers', (done) => {
      chai.request(server)
        .get('/api/user')
        .end((err, res) => {
          res.body.should.be.an('object');
          let { status, result } = res.body;
          status.should.equals(200)
          result.should.be.a('array');
          // result.should.be.equals(1);
          done();
        });
    });
  });

  // describe('UC-204 get single user by id', () => {
  //   it('TC-204-1 Ongeldige token', (done) => {
      
  //   })
  // })
});


