const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");
const mealController = require("../controllers/meal.controller");

router.post("/meal", authController.validateToken, mealController.validateMeal, mealController.addMeal);

router.get("/meal", mealController.getAllMeals);

router.get("/meal/:mealId", mealController.getMealById);

router.delete("/meal/:mealId", authController.validateToken, mealController.deleteMeal);
// router.get("/user/profile", authController.validateToken, userController.getProfile);



// router.put("/user/:userId", authController.validateToken, userController.validateUpdateUser, userController.updateUser);


module.exports = router;