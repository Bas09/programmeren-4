process.env.DB_DATABASE = process.env.DB_DATABASE || 'shareamealtestdb'
const chai = require('chai');
const chaiHttp = require('chai-http');
const { object } = require('joi');
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



     const INSERT_MEAL =
     'INSERT INTO `meal` VALUES' +
     '(1,1,1,1,1,"2022-03-22 17:35:00",4,12.75,"https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",1,"2022-02-26 18:12:40.048998","2022-04-26 12:33:51.000000","Pasta Bolognese met tomaat, spekjes en kaas","Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!","gluten,lactose"),' +
     '(2,0,0,0,0,"2022-03-22 17:35:00",4,12.75,"https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",2,"2022-02-26 18:12:40.048998","2022-04-26 12:33:51.000000","Pasta Bolognese met tomaat, spekjes en kaas","Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!","gluten,lactose");'
   
     
describe('Manage meals /api/meal', () => {

    beforeEach((done) => {
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err // not connected!

            // Use the connection
            connection.query(
                CLEAR_DB + INSERT_USER + INSERT_MEAL,
                function (error, results, fields) {
                    // When done with the connection, release it.
                    connection.release()
                    if (error) throw error
                    done()
                }
            )
        })
    })

    describe('UC-301 Create meal', () => {

        it('TC-301-1 Mandatory field is missing', (done) => {
            let meal = {
                dateTime: '2022-03-22T16:35:00.000Z',
                maxAmountOfParticipants: 4,
                price: 12.75,
                imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
                name: 'Pasta Bolognese met tomaat, spekjes en kaas',
                //description:'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!', description is missing
                isActive: true,
                isVega: true,
                isVegan: true,
                isToTakeHome: true,
                allergenes: ['gluten', 'lactose']
            }
            chai.request(server)
                .post('/api/meal')
                .set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
                .send(meal)
                .end((err, res) => {
                    res.body.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(400);
                    message.should.be.a('string').that.equals('description must be a string');
                    done();
                });
        });

        it('TC-301-2 Not logged in', (done) => {
            let meal = {
                dateTime: '2022-03-22T16:35:00.000Z',
                maxAmountOfParticipants: 4,
                price: 12.75,
                imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
                name: 'Pasta Bolognese met tomaat, spekjes en kaas',
                description: 'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!',
                isActive: true,
                isVega: true,
                isVegan: true,
                isToTakeHome: true,
                allergenes: ['gluten', 'lactose']
            }
            chai.request(server)
                .post('/api/meal')
                //.set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)) authorization missing
                .send(meal)
                .end((err, res) => {
                    res.body.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(401);
                    message.should.be.a('string').that.equals('Authorization header missing!');
                    done();
                });
        });

        it('TC-301-3 Meal successfully added', (done) => {
            let meal = {
                name: 'Spaghetti Bolognese',
                description: 'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!',
                isActive: true,
                isVega: true,
                isVegan: true,
                isToTakeHome: true,
                dateTime: '2022-04-26 12:33:51.000000',
                imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
                allergenes: ['gluten' ,'lactose'],
                maxAmountOfParticipants: 4,
                price: 12.75
              }
            chai.request(server)
                .post('/api/meal')
                .set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
                .send(meal)
                .end((err, res) => {
                    res.body.should.be.an('object');
                    let { status, result } = res.body;
                    status.should.equals(201);
                    res.should.be.a("object");
                    result.should.be.a('array');
                    done();
                });
        });
    });

    describe('UC-302 Update meal', () => {
        it('TC-302-1 mandatory field missing', (done) => {
        let meal = {
            dateTime: '2022-03-22T16:35:00.000Z',
            maxAmountOfParticipants: 4,
            //price: 12.75, 
            imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
            name: 'Pasta Bolognese met tomaat, spekjes en kaas',
            description:'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!', 
            isActive: true,
            isVega: true,
            isVegan: true,
            isToTakeHome: true,
            allergenes: ['gluten', 'lactose']
        }
        chai.request(server)
            .put('/api/meal/1')
            .set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
            .send(meal)
            .end((err, res) => {
                res.body.should.be.an('object');
                let { status, message } = res.body;
                status.should.equals(400);
                message.should.be.a('string').that.equals('price must be a number');
                done();
            });
    });

    it('TC-302-2 not logged in', (done) => {
        let meal = {
            dateTime: '2022-03-22T16:35:00.000Z',
            maxAmountOfParticipants: 4,
            price: 12.75, 
            imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
            name: 'Pasta Bolognese met tomaat, spekjes en kaas',
            description:'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!', 
            isActive: true,
            isVega: true,
            isVegan: true,
            isToTakeHome: true,
            allergenes: ['gluten', 'lactose']
        }
        chai.request(server)
            .put('/api/meal/1')
           // .set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
            .send(meal)
            .end((err, res) => {
                res.body.should.be.an('object');
                let { status, message } = res.body;
                status.should.equals(401);
                message.should.be.a('string').that.equals('Authorization header missing!');
                done();
            });
    });

    it('TC-302-3 Not the owner of the data', (done) => {
        let meal = {
            dateTime: '2022-03-22T16:35:00.000Z',
            maxAmountOfParticipants: 4,
            price: 12.75, 
            imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
            name: 'Pasta Bolognese met tomaat, spekjes en kaas',
            description:'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!', 
            isActive: true,
            isVega: true,
            isVegan: true,
            isToTakeHome: true,
            allergenes: ['gluten', 'lactose']
        }
        chai.request(server)
            .put('/api/meal/1')
            .set('authorization','Bearer ' + jwt.sign({ userId: 2 }, jwtSecretKey))
            .send(meal)
            .end((err, res) => {
                res.body.should.be.an('object');
                let { status, message } = res.body;
                status.should.equals(403);
                message.should.be.a('string').that.equals('User not allowed to delete this meal');
                done();
            });
    });

    it('TC-302-4 Meal does not exist', (done) => {
        let meal = {
            dateTime: '2022-03-22T16:35:00.000Z',
            maxAmountOfParticipants: 4,
            price: 12.75, 
            imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
            name: 'Pasta Bolognese met tomaat, spekjes en kaas',
            description:'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!', 
            isActive: true,
            isVega: true,
            isVegan: true,
            isToTakeHome: true,
            allergenes: ['gluten', 'lactose']
        }
        chai.request(server)
            .put('/api/meal/3333') // meal id does not exist
            .set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
            .send(meal)
            .end((err, res) => {
                res.body.should.be.an('object');
                let { status, message } = res.body;
                status.should.equals(404);
                message.should.be.a('string').that.equals('meal does not exist');
                done();
            });
    });

    it('TC-302-5 Meal changed successfully', (done) => {
        let meal = {
            dateTime: '2022-03-22T16:35:00.000Z',
            maxAmountOfParticipants: 4,
            price: 12.75, 
            imageUrl: 'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',
            name: 'Pasta Bolognese met tomaat, spekjes en kaas',
            description:'Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!', 
            isActive: true,
            isVega: true,
            isVegan: true,
            isToTakeHome: true,
            allergenes: ['gluten', 'lactose']
        }
        chai.request(server)
            .put('/api/meal/1') 
            .set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
            .send(meal)
            .end((err, res) => {
                res.body.should.be.an('object');
                let { status, result } = res.body;
                status.should.equals(200);
                result.should.be.a('array');
                done();
            });
    });


    });



    describe('UC-303 Request a list of meals', () => {
        it('TC-303-1 List of meals returned', (done) => {
            chai.request(server)
                .get('/api/meal')
                .end((err, res) => {
                    res.body.should.be.an('object');
                    let { status, result } = res.body;
                    status.should.equals(200);
                    result.should.be.a('array');
                    done();
                });
        });
    });

    describe('UC-304 Request details of a meal', () => {
        it('TC-304-1 Meal does not exist', (done) => {
            chai.request(server)
                .get('/api/meal/8588') // meal with this id does not exist
                .end((err, res) => {
                    res.body.should.be.an('object');
                    let { status, message } = res.body;
                    status.should.equals(404);
                    message.should.be.a('string').that.equals('No meal found');
                    done();
                });
        });

        it('TC-304-2 Details of meal returned', (done) => {
            chai.request(server)
                .get('/api/meal/1') 
                .end((err, res) => {
                    res.body.should.be.an('object');
                    let { status, result } = res.body;
                    status.should.equals(200);
                    result.should.have.property('id');
                    result.should.have.property('name');
                    result.should.have.property('description');
                    result.should.have.property('isToTakeHome');
                    result.should.have.property('imageUrl');
                    result.should.have.property('price');
                    result.should.have.property('isVega');
                    result.should.have.property('isVegan');
                    result.should.have.property('isActive');
                    result.should.have.property('dateTime');
                    done();
                });
        });
    });


    describe('UC-305 Delete meal', () => {
 
        it('TC-305-2 User not logged in', (done) => {
          chai.request(server)
            .delete('/api/meal/2')
            //.set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
            .end((err, res) => {
              res.should.be.an('object');
              let { status, message } = res.body;
              status.should.equals(401)
              message.should.be.a('string').that.equals('Authorization header missing!');
              done();
            });
        });
    
        it('TC-305-3 Actor is not owner', (done) => {
          chai.request(server)
            .delete('/api/meal/1')
            .set('authorization','Bearer ' + jwt.sign({ userId: 2 }, jwtSecretKey))
            .end((err, res) => {
              res.should.be.an('object');
              let { status, message } = res.body;
              status.should.equals(403)
              message.should.be.a('string').that.equals('User not allowed to delete this meal');
              done();
            });
        });
    
    
    
        it('TC-305-4 Meal does not exist', (done) => {
          chai.request(server)
            .delete('/api/meal/9999') // meal with this id does not exist
            .set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
            .end((err, res) => {
              let { status, message } = res.body;
              status.should.equals(404);
              message.should.be.a('string').that.equals('meal does not exist');
              done();
            });
        });

        it('TC-305-5 Meal successfully removed', (done) => {
            chai.request(server)
              .delete('/api/meal/1')
              .set('authorization','Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
              .end((err, res) => {
                res.should.be.an('object');
                let { status, result } = res.body;
                status.should.equals(200)
                result.should.be.a('array');
                done();
              });
          });
    
 
      });
});
