const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

//constants
const app = express();
const PORT = process.env.PORT;

//middlewares
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

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

app.post("/register", (req, res) => {
  console.log(req.body);
  return res.send("Register successfull");
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
