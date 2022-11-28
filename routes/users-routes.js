const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const usersController = require("../controllers/users-controller");
const fileUpload = require("../middleware/file-upload");

/** ROUTE STARTS WITH api/users */

router.get("/", usersController.getAllUsers); // get all users
router.get("/:uid", usersController.getUser); // get specific user

// signup
router.post(
  "/signup",
  fileUpload.single("image"),
  [check("username").not().isEmpty(), check("password").isLength({ min: 5 })],
  usersController.signUp
);

// user login
router.post("/login", usersController.userLogin);

// update user
router.post(
  "/:uid",
  [check("username").not().isEmpty(), check("password").isLength({ min: 5 })],
  usersController.updateUser
);

module.exports = router;
