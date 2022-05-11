const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

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

  router.get("/", (req, res) => {
    res.status(200).json({
      status: 200,
      result: "Share-a-meal app",
    });
  });

// UC-201 Register as a new user


// router.post("/", userController.addUser)
   



// UC-202 Get all users
router.get("/api/user", function (req, res) {
    res.send(database);
  });
  
 
// UC-203 Request personal user profile
router.get("/api/user/profile", function(req, res) {
    res.status(200).json({
        statusCode: 200,
        message: 'route/function not working yet'
    });
});


// UC-204 Get single user by ID
router.get("/api/user/:userId", function(req, res) {
    const userId = req.params.userId;
    console.log('User searched with id: ${userId}');
    const user = database.filter((item) => item.id == userId);
    if (user.length > 0) {
        res.send(database[userId]);
    }
});

// UC-205 Update a single user
router.put("/api/user/:userId", function (req, res) {
    let emailAdress = req.body.emailAdress;
    let user = req.body;
    const userId = req.params.userId;
    
    let item = database.filter((item) => item.emailAdress == emailAdress);
    if (item.length > 0) {
      if (req.params.userId != item[0].id) {
        res.status(400).json({
          statusCode: 400,
          message: `Emailadress already taken!`,
        });
      } else {
        user = { id: userId, ...user };
        database[userId] = user;
        res.send(database[userId]);
      }
    } else {
      user = { id: userId, ...user };
      database[userId] = user;
      res.send(database[userId]);
    }
  });

// UC-206 Delete a user
router.delete("/api/user/:userId", function (req, res) {
    const userId = req.params.userId;
    let user = req.body;
    
    try {
      const specificUser = database.filter((item) => item.id == userId);
      if (specificUser.length > 0) { 
        database.splice(userId, 1);
      
      res.status(200).json({
        statusCode: 200,
        message: `User has been deleted!`,
      });
    }
    } catch (Exception) {
      res.status(400).json({
        Status: 400,
        Message: `Body does not include emailadress!`,
      });
    }
  });


  module.exports = router;

