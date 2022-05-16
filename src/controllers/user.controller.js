const assert = require("assert");
const res = require("express/lib/response");
const dbconnection = require("../../database/dbconnection");


let controller = {
    validateUser: (req, res, next) => {
        let user = req.body;
        let { firstName, lastName, street, city, password, emailAdress } = user;

        try {
            assert(typeof firstName === "string", "firstName must be a string");
            assert(typeof lastName === "string", "lastName must be a string");
            assert(typeof street === "string", "street must be a string");
            assert(typeof city === "string", "city must be a string");
            assert(typeof password === "string", "password must be a string");
            assert(typeof emailAdress === "string", "emailAdress must be a string");
            next();
        } catch (err) {
            res.status(400).json({
                statusCode: 400,
                error: err.message,
            });
        }
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
    addUser: (req, res) => {
        const user = req.body;

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err;

            dbconnection.query(
                "INSERT INTO user (firstName, lastName, street, city, password, emailAdress) VALUES (?, ?, ?, ?, ?, ?);", [
                user.firstName,
                user.lastName,
                user.street,
                user.city,
                user.password,
                user.emailAdress,
            ],
                function (error, results, fields) {
                    connection.release();

                    if (error) {
                        res.status(409).json({
                            status: 409,
                            message: error.message,
                        });
                    } else {
                        res.status(201).json({
                            result: {
                                id: results.insertId,
                                isActive: user.isActive || true,
                                phoneNumber: user.isActive || "-",
                                ...user,
                            },
                        });
                    }
                }
            );
        });
    },
    // UC-202 get all users

    getAll: (req, res, next) => {
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err; // not connected!

            // Use the connection
            connection.query(
                "SELECT *, FROM user",
                function (error, results, fields) {
                    // When done with the connection, release it.
                    connection.release();

                    // Handle error after the release.
                    if (error) throw error;

                    console.log("#results = ", results.length)
                    res.status(201).json({
                        status: 201,
                        results: results,
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
        const userId = req.params.userId;
        console.log("User searched with id: ${userId}");
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err; // not connected!

            // Use the connection
            connection.query(
                "SELECT *, FROM user WHERE id = ${userId}", function (error, results, fields) {
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
                "SELECT *, FROM user WHERE id = ${userId}", function (error, results, fields) {
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



