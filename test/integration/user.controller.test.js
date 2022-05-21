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
  '(1, "John", "Doe", "johndoe@server.com", "secret", "Lovensdijkstraat", "Breda") , (2, "Henk", "Doe", "Henk@server.com", "secret", "Lovensdijkstraat", "Breda");'



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
    it('TC-202-1 Toon nul gebruikers', (done) => {
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err
        connection.query(CLEAR_DB, function (error, results, fields) {
            connection.release()
            if (error) throw error
          }
        )
      })
      chai.request(server)
        .get('/api/user?name=onbeked')
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equals(200)
          result.should.be.a('array');
          result.length.should.be.equals(0);
          //done();
        });

      dbconnection.getConnection(function (err, connection) {
        if (err) throw err 
          connection.query(INSERT_USER, function (error, results, fields) {
            connection.release()
            if (error) throw error
            done()
          }
        )
      })
    });

    it('TC-202-2 Toon twee gebruikers', (done) => {
      chai.request(server)
        .get('/api/user?name=John')
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equals(200)
          result.should.be.a('array');
          result.length.should.be.equals(1);
          done();
        });
    });

    it('TC-202-3 Toon gebruikers met zoekterm op niet-bestaande naam', (done) => {
      chai.request(server)
        .get('/api/user?name=onbekend')
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equals(200)
          result.should.be.a('array');
          result.length.should.be.equals(0);
          done();
        });
    });

    it('TC-202-4 Toon gebruikers met gebruik van de zoekterm op het veld isActive = false', (done) => {
      chai.request(server)
        .get('/api/user?isActive=false')
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equals(200)
          result.should.be.a('array');
          result.length.should.be.equals(0);
          done();
        });
    });

    it('TC-202-5 Toon gebruikers met gebruik van de zoekterm op het veld isActive = true', (done) => {
      chai.request(server)
        .get('/api/user?isActive=true')
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equals(200)
          result.should.be.a('array');
          result.length.should.be.equals(2);
          done();
        });
    });

    it('TC-202-5 Toon gebruikers met zoekterm op bestaande naam', (done) => {
      chai.request(server)
        .get('/api/user?name=John')
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equals(200)
          result.should.be.a('array');
          result.length.should.be.equals(1);
          done();
        });
    });


  });
  });

  // describe('UC-204 get single user by id', () => {
  //   it('TC-204-1 Ongeldige token', (done) => {
      
  //   })
  // })



