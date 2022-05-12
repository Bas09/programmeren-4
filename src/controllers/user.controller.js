const assert = require("assert");
const res = require("express/lib/response");
const dbconnection = require("../../database/dbconnection");

// let database = [];
// let databaseId = 0;

// // add first user to database
// database.push({
//     "id": 0,
//     "firstName": "John",
//     "lastName": "Doe",
//     "street": "Lovensdijkstraat 61",
//     "city": "Breda",
//     "isActive": true,
//     "emailAdress": "j.doe@server.com",
//     "password": "secret123",
//     "phoneNumber": "06 12425587"
// });

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

    //   validateUpdatedUser: (req, res, next) => {
    //       let user = req.body;
    //       let {firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber} = user;


    //   }

    // UC-201
    addUser: (req, res) => {
        const user = req.body;

        dbconnection.getConnection(function(err, connection) {
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
                function(error, results, fields) {
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
        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            // Use the connection
            connection.query(
                "SELECT *, FROM user",
                function(error, results, fields) {
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

    // UC-203 Request personal user profile

    getProfile: (req, res, next) => {
        res.status(404).json({
            status: 200,
            result: "route/function not working yet",
        });
    },

    // UC-204 Get user by id

    getUserById: (req, res, next) => {
        const userId = req.params.userId;
        console.log("User searched with id: ${userId}");

        connection.query(
            "SELECT * FROM user WHERE id = ${userId}",
            function(error, results, fields) => {
                if (error) {
                    console.error("error")
                }
            })


        if (user.length > 0) {
            console.log(user);
            res.status(200).json({
                status: 200,
                result: user,
            });
        } else {
            res.status(404).json({
                status: 404,
                result: `User with ID ${userId} not found`,
            });
        }
    },

    // UC-205 Update a user



    updateUser: (req, res) => {
        let user = req.body;
        const userId = database.findIndex((item) => item.id == req.params.userId);
        if (userId == -1) {
            res.status(404).json({
                status: 404,
                result: `User with ID ${req.params.userId} does not exist`,
            });
            return;
        } else if (
            user.email == null ||
            database.filter((item) => item.email == user.email).length > 0
        ) {
            res.status(404).json({
                status: 404,
                result: "Emailaddress already taken!",
            });
            return;
        }

        database.splice(userId, 1);

        user = {
            id: req.params.userId,
            ...user,
        };
        database.push(user);

        console.log(`User with id ${req.params.userId} updated`);
        res.status(200).json({
            status: 200,
            result: `User with id ${req.params.userId} updated`,
        });
    },

    // UC-206 delete user

    deleteUser: (req, res) => {
        const userIndex = database.findIndex(
            (item) => item.id == req.params.userId
        );
        if (userIndex.length > 0) {
            database.splice(userIndex, 1);
            console.log("User with id ${req.params.userId} successfully deleted");
            res.status(200).json({
                status: 200,
                result: `User ${req.params.userId} has been deleted!`,
            });
            return;
        } else {
            res.status(404).json({
                status: 404,
                result: `User ${req.params.userId} does not exist`,
            });
        }
    },
};

module.exports = controller;