const express = require("express");

const AuthRouter = express.Router();

AuthRouter.get("/check", (req, res) => {
  return res.send("all ok");
});

AuthRouter.post("/register", (req, res) => {
  return res.send("resgiter all ok");
});

module.exports = AuthRouter;
