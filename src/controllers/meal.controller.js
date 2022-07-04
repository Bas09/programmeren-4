const dbconnection = require("../database/dbconnection");
const assert = require("assert");
const jwt = require('jsonwebtoken')
const logger = require('../config/config').logger
const jwtSecretKey = require('../config/config').jwtSecretKey



let controller = {

    validateMeal: (req, res, next) => {
        let meal = req.body;
        let { name, description, isToTakeHome, imageUrl, price, isVega, isVegan, isActive, dateTime, maxAmountOfParticipants } = meal;

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
            assert.equal(typeof maxAmountOfParticipants, 'number', 'maxAmountOfParticipants must be a number');

            next();
        } catch (err) {
            console.log(err);
            res.status(400).json({
                status: 400,
                message: err.message
            });
        }
    },


    // UC-301 Add Meal
    addMeal: (req, res, next) => {
        let meal = req.body;
        let userId = req.userId;

        meal.allergenes = meal.allergenes.toString();
        meal.cookId = userId;
        logger.info('Adding meal: ', meal);

        dbconnection.getConnection(function (err, connection) {
            if (err) next(err);
            connection.query('INSERT INTO meal SET ?; SELECT * FROM meal;', meal, function (error, results, fields) {
                connection.release();
                if (err) next(err);
        
                connection.query('INSERT INTO meal_participants_user SET ?;', { mealId: results[0].insertId, userId: userId }, function (error, results, fields) {
                    if (err) next(err);
                });

                    res.status(201).json({
                        status: 201,
                        result: results[1]
                    });
                });
        });
    },

  

    // UC-302 update meal
    updateMeal: (req, res, next) => {
        let updateMealId = req.params.mealId;
        let userId = req.userId;
        let { name, description, isToTakeHome, imageUrl, price, isVega, isVegan, isActive, dateTime, maxAmountOfParticipants, allergenes } = req.body;
        let stringAllergenes = allergenes.toString();
        logger.info('Updating meal with id: ', updateMealId);

        dbconnection.getConnection(function (err, connection) {
            if (err) next(err); // not connected!

            // Use the connection
            if (userId) {
                connection.query(
                    'SELECT * FROM meal WHERE id = ?;', [updateMealId], function (error, results, fields) {
                        if (err) next(err);

                        if (results.length > 0) {
                            connection.query(
                                `UPDATE meal SET name =?, description =?, isToTakeHome =?, imageUrl =?, price =?, isVega =?, isVegan =?, isActive =?, dateTime =?, maxAmountOfParticipants =? , allergenes =?  
                                WHERE id = ? AND cookId = ?; SELECT * FROM meal;`, 
                                [name, description, isToTakeHome, imageUrl, price, isVega, isVegan, isActive, dateTime, maxAmountOfParticipants, stringAllergenes, updateMealId, userId ],
                                function (error, results, fields) {
                                    connection.release();
                                    if (err) next(err);

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

    // UC-303 Get all meals 
    getAllMeals: (req, res, next) => {
        dbconnection.getConnection(function (err, connection) {
            if (err) next(err);

            connection.query('SELECT * FROM meal;',
                function (error, results, fields) {
                    connection.release();
                    if (err) next(err);

                    res.status(200).json({
                        status: 200,
                        result: results
                    });
                });
        });
    },

    // UC-304 Request meal by id
    getMealById: (req, res, next) => {
        let mealId = req.params.mealId;
        logger.info('Getting meal by id: ', mealId);

        dbconnection.getConnection(function (err, connection) {
            if (err) next(err);

            connection.query('SELECT * FROM meal WHERE id = ?;', [mealId], function (error, results, fields) {
                connection.release();
                if (err) next(err);

                if (results.length > 0) {
                    res.status(200).json({
                        status: 200,
                        result: results[0]
                    });
                } else {
                    res.status(404).json({
                        status: 404,
                        message: 'No meal found'
                    });
                };
            });
        });
    },


    // UC-305 Delete meal
    deleteMeal: (req, res, next) => {
        let deleteMealId = req.params.mealId;
        let userId = req.userId;
        logger.info('Deleting meal with id: ', deleteMealId);

        dbconnection.getConnection(function (err, connection) {
            if (err) next(err); // not connected!

            // Use the connection
            if (userId) {
                connection.query(
                    'SELECT * FROM meal WHERE id = ?;', [deleteMealId], function (error, results, fields) {
                        if (err) next(err);

                        if (results.length > 0) {
                            connection.query(
                                `DELETE FROM meal WHERE id = ? AND cookId = ?; SELECT * FROM meal;`, [deleteMealId, userId],
                                function (error, results, fields) {
                                    connection.release();
                                    if (err) next(err);


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
}
module.exports = controller;


