const User = require("../models/users");
const HttpError = require("../models/http-error");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const SALT_ROUNDS = 10;

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (err) {
    console.log(err);
    return next(new HttpError("There are no user created.", 422));
  }
};

const getUser = async (req, res, next) => {
  const { uid } = req.params;
  try {
    const getUser = await User.findOne({ _id: uid });
    res.json(getUser);
  } catch (err) {
    console.log(err);
    return next(new HttpError("Could not find the user: ", 422));
  }
};

const signUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Input validation failed!", 422));
  }

  const { password } = req.body;
  const hashed_pass = bcrypt.hashSync(password, SALT_ROUNDS);
  try {
    const newUser = await User.create({
      ...req.body,
      image: req.file.path,
      password: hashed_pass,
    });
    // Create JWT
    const token = jwt.sign(
      {
        userId: newUser._id,
        username: newUser.username,
        fullName: newUser.fullName,
      },
      process.env.JWT_KEY,
      { expiresIn: "1hr" }
    );
    res.json({
      token: token,
      userId: newUser._id,
      username: newUser.username,
      fullName: newUser.fullName,
    });
  } catch (err) {
    console.log(err);
    // res.json({ error: err });
    return next(new HttpError("Error: " + err._message, 422));
  }
};

const updateUser = async (req, res, next) => {
  const { uid } = req.params;
  try {
    const update = await User.findByIdAndUpdate(uid, { ...req.body }); // You should set the new option to true to return the document after update was applied.
    res.json(req.body);
  } catch (err) {
    console.log(err);
    return next(new HttpError("Could not update user!", 422));
  }
};

const userLogin = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const getUser = await User.findOne({ username });
    if (getUser) {
      // compare hashpass
      if (bcrypt.compareSync(password, getUser.password)) {
        // Create JWT
        const token = jwt.sign(
          {
            userId: getUser._id,
            username: getUser.username,
            fullName: getUser.fullName,
          },
          process.env.JWT_KEY,
          { expiresIn: "1hr" }
        );
        res.json({
          token: token,
          userId: getUser._id,
          username: getUser.username,
          fullName: getUser.fullName,
        });
      } else {
        // return next(new HttpError("Password Incorrect!", 403));
        return res.json({ error: "Password Incorrect!" });
      }
    } else {
      // return next(new HttpError("Could not find user!", 500));
      return res.json({ error: "Could not find user!" });
    }
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("There's something wrong, please try again!", 403)
    );
  }
};

exports.getAllUsers = getAllUsers;
exports.getUser = getUser;
exports.signUp = signUp;
exports.updateUser = updateUser;
exports.userLogin = userLogin;
