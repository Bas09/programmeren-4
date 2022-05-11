const assert = require('assert');
const res = require('express/lib/response');

let database = [];
let databaseId = 0;


// add first user to database
database.push({
    "id": 0,
    "firstName": "John",
    "lastName": "Doe",
    "street": "Lovensdijkstraat 61",
    "city": "Breda",
    "isActive": true,
    "emailAdress": "j.doe@server.com",
    "password": "secret123",
    "phoneNumber": "06 12425587"
});

let controller = {

    // UC-201 
    addUser: (req, res) => {
        const user = req.body;
        const emailAdress = req.body.emailAdress;

        if (emailAdress != null) {
            if (database.filter((item) => item.emailAdress == emailAdress).length > 0) {
                res.status(400).json({
                    status: 400,
                    result: 'EmailAdress already taken!'
                });
            } else {
                databaseId++
                database.push({
                    id: databaseId,
                    ...user,
                });
                res.json(database.filter((item) => item.emailAdress == emailAdress));
            }
        } else {
            res.status(400).json({
                status: 400,
                result: 'body does not cointain emailadress!',
            });
        }
    },

    // UC-202 get all users

    getAllUsers: (req, res) => {
        console.log(database)
        res.status(200).json({
            status: 200,
            result: database,
        })
      
    },

    // UC-203 Request personal user profile

    getProfile: (req, res) => {
        res.status(404).json({
            status: 200,
            result: 'route/function not working yet'
        });
    },

    // UC-204 Get user by id

    getUserById: (req, res) => {
        const userId = req.params.userId;
        console.log('User searched with id: ${userId}');
        let user = database.filter((item) => item.id == userId);
        if (user.length > 0) {
            console.log(user);
            res.status(200).json({
                status: 200,
                result: user,
            });
        } else {
            res.status(404).json({
                status: 400,
                result: `User with ID ${userId} not found`,
            });
        }
    },

    // UC-205 Update a user

    updateUser:(req, res) => {
        let user = req.body;
        const userId = database.findIndex((item) => item.id == req.params.userId)
            if(userId == -1) {
            res.status(404).json({
            status: 404,
            result: `User with ID ${req.params.userId} does not exist`
            })
            return
        } else if(user.email == null || database.filter((item) => item.email == user.email).length > 0) {
            res.status(404).json({
            status: 404,
            result: "Emailaddress already taken!"
            })
            return
        }

        database.splice(userId, 1)

        user = {
            id:req.params.userId,
            ...user
        }
        database.push(user)

        console.log(`User with id ${req.params.userId} updated`)
        res.status(200).json({
            status: 200,
            result: `User with id ${req.params.userId} updated`
        })
    },



    // UC-206 delete user

    deleteUser: (req, res) => {
        const userIndex = database.findIndex((item) => item.id == req.params.userId);
            if (userIndex.length > 0) {
                database.splice(userIndex, 1);
                console.log('User with id ${req.params.userId} successfully deleted')
                res.status(200).json({
                    status: 200,
                    result: `User ${req.params.userId} has been deleted!`
                });
                return
            } else {
                res.status(404).json({
                    status: 404,
                    result: `User ${req.params.userId} does not exist`
                })
            }
        }  
    }


module.exports = controller;
