const dbconnection = require("../database/dbconnection");
const assert = require("assert");
const jwt = require('jsonwebtoken')
const logger = require('../config/config').logger
const jwtSecretKey = require('../config/config').jwtSecretKey






let controller = {

    validateMeal: (req, res, next) => {
        let meal = req.body;
        let { name, description, isToTakeHome, imageUrl, price, isVega, isVegan, isActive, dateTime, } = meal;

        try {
            assert.equal(typeof name, 'string', 'name must be a string');
            assert.equal(typeof description, 'string', 'description must be a string');
            assert.equal(typeof isToTakeHome, 'boolean', 'isToTakeHome must be a boolean');
            assert.equal(typeof imageUrl, 'string', 'imageUrl must be a string');
            assert.equal(typeof price, 'number', 'price must be a number');
            assert.equal(typeof isVega, 'boolean', 'isVega must be a boolean');
            assert.equal(typeof isVegan, 'boolean', 'isVegan must be a boolean');
            assert.equal(typeof isActive, 'boolean', 'isActive must be a boolean');
            assert.equal(typeof dateTime, 'string', 'dateTime must be a string');

            next();
        } catch (err) {
            console.log(err);
            res.status(400).json({
                status: 400,
                message: err.message
            });
        }
    },

    addMeal: (req, res, next) => {
        let meal = req.body;
        let userId = req.userId;

        meal.allergenes = meal.allergenes.toString();
        meal.cookId = userId;
        logger.info('Adding meal: ', meal);


        dbconnection.getConnection(function (err, connection) {
            if (err) throw err;

            connection.query('INSERT INTO meal SET?; SELECT * FROM meal;',
                meal,
                function (error, results, fields) {
                    connection.release();
                    if (err) throw error;

                    connection.query('INSERT INTO meal_participants_user SET ?;',
                        { mealId: results[0].insertId, userId: userId },
                        function (error, results, fields) {
                            if (error) throw error;
                        });

                    res.status(201).json({
                        status: 201,
                        result: results[1]
                    });
                });
        });
    },

    getAllMeals: (req, res, next) => {
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err;

            connection.query('SELECT * FROM meal;',
                function (error, results, fields) {
                    connection.release();
                    if (err) throw error;


                    res.status(200).json({
                        status: 200,
                        result: results
                    });
                });
        });
    },


    getMealById: (req, res, next) => {
        let mealId = req.params.mealId;
        logger.info('Getting meal by id: ', mealId);

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err;

            connection.query('SELECT * FROM meal WHERE id = ?;', [mealId], function (error, results, fields) {
                connection.release();
                if (error) throw error;

                if (results.length > 0) {
                    res.status(200).json({
                        status: 200,
                        result: results[0]
                    });
                } else {
                    res.status(404).json({
                        status: 404,
                        message: 'No meal found'
                    })
                };


            });
        });
    },

    deleteMeal: (req, res) => {
        let deleteMealId = req.params.mealId;
        let userId = req.userId;
        logger.info('Deleting meal with id: ', deleteMealId);

        dbconnection.getConnection(function (err, connection) {
            if (err) throw(err) // not connected!

            // Use the connection
            if(userId) {
            connection.query(
                'SELECT * FROM meal WHERE id = ?;', [deleteMealId], function (error, results, fields) {
                    if (error) throw error;
                    
                    if (results.length > 0) {
                        connection.query(
                            `DELETE FROM meal WHERE id = ? AND cookId = ?; SELECT * FROM meal;`, [deleteMealId, userId],
                            function (error, results, fields) {
                                    connection.release();
                                  if (error) throw error;
                                    

                                    if (results[0].affectedRows > 0) {
                                        res.status(200).json({
                                            status: 200,
                                            result: results[1]
                                        });
                                    } else {
                                        res.status(403).json({
                                            status: 403,
                                            message: "User not allowed to delete this meal"
                                        });
                                    }
                                })
                    } else {
                        res.status(404).json({
                            status: 404,
                            message: "meal does not exist"
                        });
                    }
                });
            };
        });

    },

    // deleteMeal: (req, res, next) => {
    //     let id = req.params.mealId;
    //     let userId = req.userId;
    //     logger.info('Deleting meal with id: ', id);
    
    //     database.getConnection(function (err, connection) {
    //       if (err) throw err;
    
    //       if (userId) {
    //         connection.query('SELECT * FROM meal WHERE id = ?;', [id], function (error, results, fields) {
    //           if (error) throw error;
    
    //           if (results.length > 0) {
    //             connection.query(`DELETE FROM meal WHERE id = ? AND cookId = ?; SELECT * FROM meal;`, [id, userId], function (error, results, fields) {
    //               if (error) throw error;
    
    //               if (results[0].affectedRows > 0) {
    //                 res.status(200).json({
    //                   status: 200,
    //                   result: results[1]
    //                 });
    //               } else {
    //                 const error = {
    //                   status: 403,
    //                   message: 'Not allowed to edit'
    //                 };
    //                 next(error);
    //               }
    //             });
    //           } else {
    //             const error = {
    //               status: 404,
    //               message: 'Meal not found'
    //             };
    //             next(error);
    //           }
    //         });
    //       }
    //     });
    //   },






}
module.exports = controller;


