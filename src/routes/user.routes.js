const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.post("/user", userController.validateUser, userController.addUser);

router.get("/user", userController.getAll);

router.get("/user/profile", userController.getProfile);

router.get("/user/:userId", userController.getUserById);

router.put("/user/:userId", userController.updateUser);

router.delete("/user/:userId", userController.deleteUser);

module.exports = router;