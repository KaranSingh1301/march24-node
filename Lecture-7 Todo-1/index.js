const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const bcrypt = require("bcryptjs");

//file-import
const { userDataValidation } = require("./utils/authUtils");
const userModel = require("./models/userModel");

//constants
const app = express();
const PORT = process.env.PORT;

//middlewares
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//db connectionn
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongodb connected");
  })
  .catch((err) => {
    console.log(err);
  });

//api

app.get("/", (req, res) => {
  return res.send("Todo Server is running");
});

app.get("/register", (req, res) => {
  return res.render("registerPage");
});

app.post("/register", async (req, res) => {
  const { name, email, username, password } = req.body;

  //Data validation
  try {
    await userDataValidation({ name, email, username, password });
  } catch (error) {
    return res.status(400).json(error);
  }

  //hashed the password
  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(process.env.SALT)
  );

  const userObj = new userModel({
    name,
    email,
    username,
    password: hashedPassword,
  });

  console.log(userObj);

  try {
    const userDb = await userObj.save();
    //return res.status(201).json("Register successfull");
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

app.get("/login", (req, res) => {
  return res.render("loginPage");
});

app.post("/login", (req, res) => {
  console.log(req.body);
  return res.send("Login successfull");
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT:${PORT}`);
});
