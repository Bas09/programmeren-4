const assert = require("assert");
const dbconnection = require("../database/dbconnection");
const logger = require("../config/config").logger;

let controller = {
    validateUser: (req, res, next) => {
        let user = req.body;
        const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
        const phoneNumberRegex = /^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

        let { firstName, lastName, emailAdress, password, street, city, phoneNumber } = user;

        try {
            assert.equal(typeof firstName, 'string', 'firstName must be a string');
            assert.equal(typeof lastName, 'string', 'lastName must be a string');
            assert.equal(typeof emailAdress, 'string', 'emailAdress must be a string');
            assert.equal(typeof password, 'string', 'password must be a string');
            assert.equal(typeof street, 'string', 'street must be a string');
            assert.equal(typeof city, 'string', 'city must be a string');
           // assert.equal(typeof phoneNumber, 'string', 'phoneNumber must be a string') 

            assert.match(emailAdress, emailRegex, "Email must be valid");
            assert.match(password, passwordRegex, "Password must be valid");
            assert.match(phoneNumber, phoneNumberRegex, "phone number must be valid")
            next();
        } catch (err) {
            console.log(err);
            res.status(400).json({
                status: 400,
                message: err.message
            });
        }
    },

    validateUpdateUser: (req, res, next) => {
        let user = req.body;
        const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
        const phoneNumberRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/

        let { firstName, lastName, emailAdress, password, street, city, phoneNumber } = user;

        try {
            assert.equal(typeof firstName, 'string', 'firstName must be a string');
            assert.equal(typeof lastName, 'string', 'lastName must be a string');
            assert.equal(typeof emailAdress, 'string', 'emailAdress must be a string');
            assert.equal(typeof password, 'string', 'password must be a string');
            assert.equal(typeof street, 'string', 'street must be a string');
            assert.equal(typeof city, 'string', 'city must be a string');
            assert.equal(typeof phoneNumber, 'string', 'phoneNumber must be a string');

            assert.match(emailAdress, emailRegex, "Email must be valid");
            assert.match(password, passwordRegex, "Password must be valid");
            assert.match(phoneNumber, phoneNumberRegex, "phoneNumber must be valid");
            next();
        } catch (err) {
            console.log(err);
            res.status(400).json({
                status: 400,
                message: err.message
            });
        }
    },


    //  UC-201 Register as a new user
    addUser: (req, res, next) => {
        let user = req.body;

        dbconnection.getConnection(function (err, connection) {
            if (err) next(err);

            connection.query("SELECT * FROM user", function (error, results, fields) {
                if (err) next(err);

                if (results.filter(item => item.emailAdress === user.emailAdress).length === 0) {
                    connection.query('INSERT INTO user SET ?; SELECT * FROM user;', user, function (error, results, fields) {
                        connection.release();
                        if (err) next(err);


                        res.status(201).json({
                            status: 201,
                            result: user
                        });
                    });
                } else {
                    res.status(409).json({
                        status: 409,
                        message: "EmailAdress already in use"
                    });
                }
            });
        });
    },


    //UC-202 get all users
    getAll: (req, res, next) => {
        let { firstName, isActive } = req.query;
        let query = 'SELECT * FROM user';
        logger.info('Getting all users');

        if (isActive && firstName) {
            query += ` WHERE firstName = '${firstName}' AND isActive = ${isActive}`;
          } else if (isActive) {
            query += ` WHERE isActive = ${isActive}`;
          } else if (firstName) {
            query += ` WHERE firstName = '${firstName}'`;
          }

        query += ';';

        dbconnection.getConnection(function (err, connection) {
            if (err) next(err);

            connection.query(query, function (error, results, fields) {
                connection.release();
                if (err) next(err);

                res.status(200).json({
                    status: 200,
                    result: results
                });
            });
        });
    },

    // UC-203 Request user profile

    getProfile: (req, res, next) => {
        dbconnection.getConnection(function (err, connection) {
            let userId = req.userId;

            if (err) next(err); // not connected!

            // Use the connection
            connection.query("SELECT * FROM user WHERE id = ?;", [userId], function (error, results, fields) {
                connection.release();
                // Handle error after the release.
                if (error) {
                    console.error("Error in database")
                    console.debug(error)
                    return;
                } else {
                    if (results && results.length) {
                        res.status(200).json({
                            status: 200,
                            result: results[0]
                        });
                    } else {
                        res.status(404).json({
                            status: 404,
                            message: "User not found!"
                        });
                    }
                }
            });
        });
    },

    // UC-204 Get a single user by id

    getUserById: (req, res, next) => {
        dbconnection.getConnection(function (err, connection) {
            let userId = req.params.userId;

            if (err) next(err); // not connected!

            // Use the connection
            connection.query("SELECT * FROM user WHERE id = ?;", [userId], function (error, results, fields) {
                connection.release();
                // Handle error after the release.
                if (error) {
                    console.error("Error in database")
                    console.debug(error)
                    return;
                } else {
                    if (results && results.length) {
                        res.status(200).json({
                            status: 200,
                            result: results[0]
                        })
                    } else {
                        res.status(404).json({
                            status: 404,
                            message: "User not found!"
                        });
                    }
                }
            });
        });
    },


    // UC-205 Update a single user
    updateUser: (req, res, next) => {
        let id = req.params.userId
        let { firstName, lastName, emailAdress, password, phoneNumber, street, city } = req.body;
        logger.info('Updating user with id: ', id);

        dbconnection.getConnection(function (err, connection) {
            if (err) next(err);

            connection.query('SELECT * FROM user WHERE id = ?;', [id], function (error, results, fields) {
                if (err) next(err);

                console.log(results);

                if (results.length > 0) {
                    connection.query(
                        `UPDATE user SET firstName = ?, lastName = ?, emailAdress = ?, password = ?, phoneNumber = ?, street = ?, city = ? WHERE id = ?; 
                  SELECT * FROM user WHERE id = ?;`,
                        [firstName, lastName, emailAdress, password, phoneNumber, street, city, id, id], function (error, results, fields) {
                            connection.release();
                            if (err) next(err);
                            res.status(200).json({
                                status: 200,
                                result: results[1][0]
                            });
                        });

                } else {
                    res.status(400).json({
                        status: 400,
                        message: "User does not exist"
                    });
                }
            });
        });
    },


    // UC-206 Delete user
    deleteUser: (req, res, next) => {
        let deleteId = req.params.userId;
        let userId = req.userId;
        logger.info('Deleting user with id: ', deleteId);

        dbconnection.getConnection(function (err, connection) {
            if (err) next(err); // not connected!

            // Use the connection
            connection.query(
                "SELECT * FROM user WHERE id = ?;", [deleteId], function (error, results, fields) {
                    if (err) next(err);

                    if (results.length > 0) {
                        if (userId == deleteId) {
                        logger.info('1 ', deleteId);
                            connection.query(
                                `DELETE FROM user WHERE id = ?; SELECT * FROM user;`, [deleteId],
                                function (error, results, fields) {
                 
                                    connection.release();
                  
                                    if (err) next(err);

                                    if (results[0].affectedRows > 0) {
                                        res.status(200).json({
                                            status: 200,
                                            result: results[1]
                                        });
                                    }
                                });
                        } else {
                            res.status(403).json({
                                status: 403,
                                message: "User not allowed to delete this user"
                            });
                        }
                    } else {
                        res.status(400).json({
                            status: 400,
                            message: "User does not exist"
                        });
                    }
                });
        });
    },
};

module.exports = controller;


