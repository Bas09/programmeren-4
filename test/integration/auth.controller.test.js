// process.env.DB_DATABASE = process.env.DB_DATABASE || 'shareamealtestdb'
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');

require('dotenv').config()
const dbconnection = require('../../src/database/dbconnection');
const { doesNotMatch } = require('assert');
const { object } = require('joi');

chai.should();
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
            if (err) throw err // not connected!

            // Use the connection
            connection.query(
                CLEAR_DB + INSERT_USER,
                function (error, results, fields) {
                    // When done with the connection, release it.
                    connection.release();
                    if (error) throw error
                    done();
                }
            )
        })
    })

    describe('UC-101 Login', () => {
        it('TC-101-1 Mandatory field is missing', (done) => {
            let user = {
                // emailAdress: "test@server.com", (email missing)
                password: "Testing193!",
            }
            chai.request(server)
                .post('/api/auth/login')
                .send(user)
                .end((err, res) => {
                    res.body.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(400);
                    message.should.be.a('string').that.equals('email must be a string.');
                    done();
                });
        });

        it('TC-101-2 Non-valid email address', (done) => {
            let user = {
                emailAdress: "fakemail", // non-valid email
                password: "Testing193!",
            }
            chai.request(server)
                .post('/api/auth/login')
                .send(user)
                .end((err, res) => {
                    res.body.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(400);
                    message.should.be.a('string').that.equals('Email must be valid');
                    done();
                });
        });

        it('TC-101-3 Non-valid password', (done) => {
            let user = {
                emailAdress: "test@server.com",
                password: "ab",
            }
            chai.request(server)
                .post('/api/auth/login')
                .send(user)
                .end((err, res) => {
                    res.body.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(400);
                    message.should.be.a('string').that.equals('Password must be valid');
                    done();
                });
        });

        it('TC-101-4 User does not exist', (done) => {
            let user = {
                emailAdress: "unknownUser@server.com",
                password: "Testing193!",
            }
            chai.request(server)
                .post('/api/auth/login')
                .send(user)
                .end((err, res) => {
                    res.body.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(404);
                    message.should.be.a('string').that.equals('User not found or password invalid');
                    done();
                });
        });

        it('TC-101-5 User successfully logged in', (done) => {
            let user = {
                emailAdress: "johndoe@server.com",
                password: "Testing193!",
            }
            chai.request(server)
                .post('/api/auth/login')
                .send(user)
                .end((err, res) => {
                    let { status, result } = res.body;
                    status.should.equals(200);
                    result.should.be.a('object');
                    result.should.have.property('id');
                    result.should.have.property('firstName');
                    result.should.have.property('lastName');
                    result.should.have.property('isActive');
                    result.should.have.property('emailAdress');
                    result.should.have.property('phoneNumber');
                    result.should.have.property('roles');
                    result.should.have.property('street');
                    result.should.have.property('city');
                    result.should.have.property('token');
                    
                    done();
                });
        });
    });
})
