const express = require("express");
const mongoose = require("mongoose");
const userModel = require("./userSchema");
const session = require("express-session");
const mongoDbSession = require("connect-mongodb-session")(session);

//constants
const app = express();
const MONGO_URI = `mongodb+srv://karan:12345@cluster0.22wn2.mongodb.net/marchTestDB`;
const store = new mongoDbSession({
  uri: MONGO_URI,
  collection: "sessions",
});

//middlwares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: "This is march nodejs batch",
    resave: false,
    saveUninitialized: false,
    store,
  })
);

//mongodb connection
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Mongodb Connected successfully");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  console.log("get method working");
  return res.send("Server app is running");
});

app.get("/register", (req, res) => {
  return res.send(`
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    </head>
    <body>
        <h1>Register form</h1>
        <form action="/register_user" method="POST">
        <label for="name">Name</label>
        <input type="text" name="name">
        <br/>
        <label for="email">Email</label>
        <input type="text" name="email">
        <br/>
        <label for="password">Password</label>
        <input type="text" name="password">
        <br/>
        <button type="submit">Submit</button>
    </form>  
    </body>
    </html>
    `);
});

app.post("/register_user", async (req, res) => {
  console.log(req.body);
  const nameC = req.body.name;
  const emailC = req.body.email;
  const passwordC = req.body.password;

  //schema
  const userObj = new userModel({
    //schema : val
    name: nameC,
    email: emailC,
    password: passwordC,
  });
  console.log(userObj);
  try {
    const userDb = await userObj.save(); //async
    console.log(userDb);
    return res.send({
      status: 201,
      message: "Registeration successfull, please login",
      data: userDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

app.get("/login", (req, res) => {
  return res.send(`
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    </head>
    <body>
        <h1>Login form</h1>
        <form action="/login_user" method="POST">
        <label for="email">Email</label>
        <input type="text" name="email">
        <br/>
        <label for="password">Password</label>
        <input type="text" name="password">
        <br/>
        <button type="submit">Submit</button>
    </form>  
    </body>
    </html>
    `);
});

// api
app.post("/login_user", async (req, res) => {
  //session base auth

  const { email, password } = req.body;
  try {
    //find the user with email
    const userDb = await userModel.findOne({ email: email });

    if (!userDb)
      return res.status(400).json("User not found, please register first");

    //compare the password

    if (password !== userDb.password)
      return res.status(400).json("Password does not matched");

    //session base auth
    console.log(req.session);
    req.session.isAuth = true;

    return res.send("login working");
  } catch (error) {
    return res.status(500).json(error);
  }
});

app.get("/check", (req, res) => {
  console.log(req.session);
  if (req.session.isAuth) {
    return res.send("Home Page");
  } else {
    return res.send("session expired, please login again");
  }
});

app.listen(8000, () => {
  console.log("Server is running on PORT:8000");
});
