const dbconnection = require("../database/dbconnection");
const assert = require("assert");
const jwt = require('jsonwebtoken')
const logger = require('../config/config').logger
const jwtSecretKey = require('../config/config').jwtSecretKey


let controller = {
    validateLogin(req, res, next) {
        // Verify that we receive the expected input
        let user = req.body;
        const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
        let { emailAdress, password } = user;

        try {
            assert.equal(typeof emailAdress, 'string', 'email must be a string.');
            assert.equal(typeof password, 'string', 'password must be a string.');
            assert.match(emailAdress, emailRegex, "Email must be valid");
            assert.match(password, passwordRegex, "Password must be valid");
            next();
        } catch (err) {
            console.log(err);
            res.status(400).json({
                status: 400,
                message: err.message
            });
        }
    },

    validateToken(req, res, next) {
        logger.info('validateToken called')
        const authHeader = req.headers.authorization
        if (!authHeader) {
            logger.warn('Authorization header missing!')
            res.status(401).json({
                status: 401,
                message: 'Authorization header missing!',
            });
        } else {
            // Strip the word 'Bearer ' from the headervalue
            const token = authHeader.substring(7, authHeader.length)

            jwt.verify(token, jwtSecretKey, (err, payload) => {
                if (err) {
                    logger.warn('Not authorized')
                    res.status(401).json({
                        status: 401,
                        message: 'Not authorized/Invalid token.',
                      
                    })
                }
                if (payload) {
                    logger.debug('token is valid', payload)
                    req.userId = payload.userId
                    next();
                }
            });
        }
    },

    login(req, res, next) {
        dbconnection.getConnection((err, connection) => {
            if (err) {
                logger.error('Error getting connection from dbconnection')
                res.status(500).json({
                    error: err.toString(),
                    datetime: new Date().toISOString(),
                })
            }
            if (connection) {
                // 1. Check whether this user account exists.
                connection.query(
                    'SELECT * FROM `user` WHERE `emailAdress` = ?',
                    [req.body.emailAdress],
                    (err, rows, fields) => {
                        connection.release()
                        if (err) {
                            logger.error('Error: ', err.toString())
                            res.status(500).json({
                                error: err.toString(),
                                datetime: new Date().toISOString(),
                            })
                        }
                        if (rows) {
                            // 2. There was a result, check the password.
                            if (
                                rows &&
                                rows.length === 1 &&
                                rows[0].password == req.body.password
                            ) {
                                logger.info(
                                    'passwords DID match, sending user and valid token'
                                )
                                // Extract the password from the userdata - we do not send that in the response.
                                const { password, ...user } = rows[0]
                                // Create an object containing the data we want in the payload.
                                const payload = {
                                    userId: user.id,
                                }

                                jwt.sign(
                                    payload,
                                    jwtSecretKey,
                                    { expiresIn: '12d' },
                                    function (err, token) {
                                        logger.debug(
                                            'User logged in, sending: ',
                                            user, token
                                        );
                                        res.status(200).json({
                                            status: 200,
                                            result: { ...user, token },
                                          });
                                    }
                                );
                            } else {
                                logger.info(
                                    'User not found or password invalid'
                                );
                                res.status(404).json({
                                    status: 404,
                                    message:'User not found or password invalid',
                                });
                            }
                        }
                    }
                );
            }
        })
    },
}
module.exports = controller;


