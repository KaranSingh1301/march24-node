const express = require("express");
const clc = require("cli-color");
require("dotenv").config();
const session = require("express-session");
const mongoDbSession = require("connect-mongodb-session")(session);

//File imports
const db = require("./db");
const AuthRouter = require("./Controllers/AuthController");
const BlogRouter = require("./Controllers/BlogController");
const isAuth = require("./Middlewares/isAuthMiddleware");
const FollowRouter = require("./Controllers/FollowController");
const cleanUpBin = require("./cron");

//constants
const app = express();
const PORT = process.env.PORT;
const store = new mongoDbSession({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

//middlwares
app.use(express.json());

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

//routes

app.use("/auth", AuthRouter);
app.use("/blog", isAuth, BlogRouter);
app.use("/follow", isAuth, FollowRouter);

app.listen(PORT, () => {
  console.log(clc.yellowBright("Server is running at:"));
  console.log(clc.yellowBright.bold.underline(`http://localhost:${PORT}`));

  cleanUpBin();
});
