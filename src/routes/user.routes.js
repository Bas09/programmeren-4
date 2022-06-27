const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller")

router.post("/user", userController.validateUser, userController.addUser);

router.get("/user", authController.validateToken, userController.getAll);

router.get("/user/profile", authController.validateToken, userController.getProfile);

router.get("/user/:userId", authController.validateToken, userController.getUserById);

router.put("/user/:userId", authController.validateToken, userController.validateUpdateUser, userController.updateUser);

router.delete("/user/:userId", authController.validateToken,  userController.deleteUser);

module.exports = router;