const assert = require("assert");
const res = require("express/lib/response");
const dbconnection = require("../../database/dbconnection");
const Joi = require('joi'); 
const { debug } = require("console");


let controller = {
    validateUser: (req, res, next) => {
        let user = req.body;


// const schema = Joi.object({
//     firstName: Joi.string().alphanum().required(),
//     lastName: Joi.string().alphanum().required(),
//     password: Joi.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/).required(),
//     street: Joi.string().required(),
//     city: Joi.string().alphanum().required(),
//     emailAdress: Joi.string().email({ minDomainSegments: 2 }),
//   });
//   const { error } = schema.validate(user);
//   if (error) {
//     const err = {
//       status: 400,
//       message: "Input must be valid"
//     };
//     next(err);
//   }
//   next();
// },

const schema = Joi.object({
    firstName: Joi.string().alphanum().required(),
    lastName: Joi.string().alphanum().required(),
    password: Joi.string(), //.regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/).required(),
    street: Joi.string().required(),
    city: Joi.string().alphanum().required(),
    emailAdress: Joi.string().email({ minDomainSegments: 2 }),
  });
  const { error } = schema.validate(user);
  if (error) {
    const err = {
      status: 400,
      // Error message wrapped variable in /" "\ for some reason
      message: error.message.replace(/"/g, '')
    };
    next(err);
  }
  next();
},


    // UC-201 Register as a new user
    addUser: (req, res, next) => {
        let user = req.body;

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err;

            dbconnection.query("SELECT * FROM user", function (error, results, fields) {
                if (error) throw error;

                if (results.filter(item => item.emailAdress == user.emailAdress).length == 0) {
                    connection.query(
                        "INSERT INTO user (firstName, lastName, street, city, password, emailAdress) VALUES (?, ?, ?, ?, ?, ?);", [
                        user.firstName,
                        user.lastName,
                        user.street,
                        user.city,
                        user.password,
                        user.emailAdress,
                    ]);
                    connection.release();
                    if (error) throw error;

                    res.status(201).json({
                        status: 201,
                        result: results
                    });
                } else if (error) {
                    res.status(409).json({
                        status: 409,
                        message: "EmailAdress already in use",
                    });
                }
                next(err)
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
                        result: results
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
        let userId = req.params.id;
    let { firstName, lastName, emailAdress, password, phoneNumber, street, city } = req.body;

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err; // not connected

            // Use the connection
            connection.query(
                "SELECT * FROM user WHERE id = ?; SELECT * FROM user WHERE emailAdress = ?;", [userId, emailAdress], function (error, results, fields) {
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
        let userId = req.params.userId;

        dbconnection.getConnection(function (err, connection) {
            if (err) next(err) // not connected!

            // Use the connection
            connection.query(
                "DELETE FROM user WHERE id = ?; SELECT * FROM USER;", [userId], function (error, results, fields) {
                    // When done with the connection, release it.
                    connection.release()

                    // Handle error after the release.
                    if (error) throw error;

                    if (results[0].affectedRows == 0) {
                        res.status(400).json({
                            status: 400,
                            message: "User not found"
                        })
                    } else {
                        res.status(200).json({
                            status: 200,
                            message: "User has been deleted",
                            result: results[1]
                        });
                    }
                });
        });
    },
};

module.exports = controller;


