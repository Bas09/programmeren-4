const assert = require("assert");
const res = require("express/lib/response");
const dbconnection = require("../../database/dbconnection");
const Joi = require('joi'); 


let controller = {
    validateUser: (req, res, next) => {
        let user = req.body;

        try {
            const schema = Joi.object({
                firstName: Joi.string().alphanum().required(),
                lastName: Joi.string().alphanum().required(),
                street: Joi.string().alphanum().required(),
                city: Joi.string().alphanum().required(),
                password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
                emailAdress: Joi.string().email({minDomainSegments: 2}).required()
            });
            schema.validate(user);

        } catch (err) {
            res.status(400).json({
                statusCode: 400,
                error: err.message,
            });
            next(err);
        }

        next();
    },

    

    // validateUpdatedUser: (req, res, next) => {
    //     let user = req.body;
    //     let { firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber } = user;

    //     try {
    //         assert(typeof emailAdress === "string", "emailAdress must be a string");
    //     } catch (err) {
    //         res.status(400).json({
    //             statusCode: 400,
    //             error: err.message,
    //         });
    //     }
    // },

    // UC-201 Register as a new user
    addUser: (req, res, next) => {
        let user = req.body;

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err;

            dbconnection.query("SELECT * FROM user", function (error, results, fields) {
                if (error) throw error;

                if (results.filter(item => item.emailAdress == user.emailAdress).length == 0) {
                    dbconnection.query(
                        "INSERT INTO user (firstName, lastName, street, city, password, emailAdress) VALUES (?, ?, ?, ?, ?, ?);", [
                        user.firstName,
                        user.lastName,
                        user.street,
                        user.city,
                        user.password,
                        user.emailAdress,
                    ]);
                    dbconnection.release();
                    if (error) throw error;

                    res.status(201).json({
                        status: 201,
                        result: results[1]
                    });
                } else if (error) {
                    res.status(409).json({
                        status: 409,
                        message: "EmailAdress already in use",
                    });
                }
            });
        });
    },



   
    // UC-202 get all users

    getAll: (req, res, next) => {
        let query = "SELECT * FROM user";
        let { firstName, isActive } = req.query;

        if (isActive || firstName) {
            query += " WHERE ";
            if (firstName) {
                query += "firstName LIKE '%${firstName}%'";
            }

            if (isActive && firstName) {
                query += " AND ";
            }

            if (isActive) {
                query += "isActive = ${isActive}";
            }
        }


        dbconnection.getConnection(function (err, connection) {
            if (err) throw err; // not connected!
            
            // Use the connection
            connection.query(query, function (error, results, fields) {
                    // When done with the connection, release it.
                    connection.release();

                    // Handle error after the release.
                    if (error) throw error;
                    res.status(200).json({
                        status: 200,
                        results: results
                    });
                });
        });
    },

    // UC-203 Request your personal user profile

    getProfile: (req, res, next) => {
        res.status(404).json({
            status: 404,
            result: "route/function not working yet",
        });
    },

    // UC-204 Get a single user by id

    getUserById: (req, res, next) => {   
        dbconnection.getConnection(function (err, connection) {
            let userId = req.params.userId;

            if (err) throw err; // not connected!

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
                            })
                        }
                    }
                });
        });
    },

    

    // UC-205 Update a single user  -----work in progress

    updateUser: (req, res, next) => {
        let user = req.body;
        const userId = req.params.userId;

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err; // not connected

            // Use the connection
            connection.query(
                "SELECT * FROM user WHERE id = ${userId}", function (error, results, fields) {
                    // When done with the connection, release it.
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
                            })
                        }
                    }
                });
        })

    },

    // UC-206 Delete user

    deleteUser: (req, res) => {
        const userId = req.params.userId;

        dbconnection.getConnection(function (err, connection) {
            if (err) next(err) // not connected!

            // Use the connection
            connection.query(
                "DELETE FROM user WHERE id = ${userId}", function (error, results, fields) {
                    // When done with the connection, release it.
                    connection.release()

                    // Handle error after the release.
                    if (error) {
                        console.log(error);
                        return;
                    } else if (results.affectedRows == 0) {
                        res.status(400).json({
                            status: 400,
                            message: "User not found"
                        })
                    } else {
                        res.status(200).json({
                            status: 200,
                            message: "User has been deleted",
                            result: results
                        });
                    }
                });
        });
    },
};

module.exports = controller;



