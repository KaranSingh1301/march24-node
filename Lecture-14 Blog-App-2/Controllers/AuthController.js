const express = require("express");
const { validateRegisterUserData } = require("../Utils/AuthUtil");
const User = require("../Models/UserModel");
const bcrypt = require("bcryptjs");
const isAuth = require("../Middlewares/isAuthMiddleware");

const AuthRouter = express.Router();

// /auth

AuthRouter.post("/register", async (req, res) => {
  const { name, email, password, username } = req.body;

  //data validation
  try {
    await validateRegisterUserData({ email, username, name, password });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Data error",
      error: error,
    });
  }

  try {
    //username and email exist or not
    await User.emailAndUsernameExist({ username, email });

    //register the user
    const userObj = new User({ name, email, username, password });

    const userDb = await userObj.registerUser();

    return res.send({
      status: 201,
      message: "Register successfull",
      data: userDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
});

AuthRouter.post("/login", async (req, res) => {
  const { loginId, password } = req.body;
  console.log(req.body);
  if (!loginId || !password)
    return res.send({
      status: 400,
      message: "Missing credentials",
    });

  //find the user
  try {
    const userDb = await User.findUserWithLoginId({ loginId });
    console.log(userDb);
    //compare the password

    const isMatch = await bcrypt.compare(password, userDb.password);

    if (!isMatch) {
      return res.send({
        status: 400,
        message: "Password does not matched",
      });
    }

    console.log(req.session);
    req.session.isAuth = true;
    req.session.user = {
      userId: userDb._id, //BSON Error --> userDb._id.toString()
      username: userDb.username,
      email: userDb.email,
    };

    return res.send({
      status: 200,
      message: "Login successfull",
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
});

AuthRouter.post("/check", isAuth, (req, res) => {
  return res.send("Working fine");
});

module.exports = AuthRouter;
