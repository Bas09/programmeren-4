const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");
const mealController = require("../controllers/meal.controller");

// add meal uc-301
router.post("/meal", authController.validateToken, mealController.validateMeal, mealController.addMeal);

// update meal
router.put("/meal/:mealId", authController.validateToken, mealController.validateUpdateMeal, mealController.updateMeal);

// get all meals uc-303
router.get("/meal", mealController.getAllMeals);

// get meal by id uc-304
router.get("/meal/:mealId", mealController.getMealById);

// delete meal uc-305
router.delete("/meal/:mealId", authController.validateToken, mealController.deleteMeal);




module.exports = router;