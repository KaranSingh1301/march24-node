const express = require("express");
const clc = require("cli-color");
require("dotenv").config();

//File imports
const db = require("./db");
const AuthRouter = require("./Controllers/AuthController");

const app = express();
const PORT = process.env.PORT;

app.get("/", (req, res) => {
  return res.send({
    status: 200,
    message: "Server is running",
  });
});

//   /auth/check , /auth/register

app.use("/auth", AuthRouter);

app.listen(PORT, () => {
  console.log(clc.yellowBright("Server is running at:"));
  console.log(clc.yellowBright.bold.underline(`http://localhost:${PORT}`));
});
