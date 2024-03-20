const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("dotenv").config();
const bcrypt = require("bcryptjs");
const session = require("express-session");
const mongoDbSession = require("connect-mongodb-session")(session);

//file-import
const { userDataValidation, isEmailRgex } = require("./utils/authUtils");
const userModel = require("./models/userModel");
const { isAuth } = require("./middlewares/authMiddleware");
const todoModel = require("./models/todoModel");
const { todoDataValidation } = require("./utils/todoUtils");

//constants
const app = express();
const PORT = process.env.PORT;
const store = new mongoDbSession({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

//middlewares
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store,
  })
);

app.use(express.static("public"));

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

  //email and username exist or not

  const userEmailExist = await userModel.findOne({ email });

  if (userEmailExist) {
    return res.send({
      status: 400,
      message: "Email already exist",
    });
  }

  const userUsernameExist = await userModel.findOne({ username });

  if (userUsernameExist) {
    return res.send({
      status: 400,
      message: "Username already exist",
    });
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

  // console.log(userObj);

  try {
    const userDb = await userObj.save();
    //return res.status(201).json("Register successfull");
    return res.redirect("/login");
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

app.post("/login", async (req, res) => {
  console.log(req.body);
  const { loginId, password } = req.body;
  //data validation
  if (!loginId || !password) return res.status(400).json("Missing credentials");

  //find the user with loginId
  try {
    let userDb;
    if (isEmailRgex({ email: loginId })) {
      userDb = await userModel.findOne({ email: loginId });
    } else {
      userDb = await userModel.findOne({ username: loginId });
    }

    if (!userDb) {
      return res.status(400).json("User not found");
    }

    //passowrd Comparision
    const isMatch = await bcrypt.compare(password, userDb.password);
    if (!isMatch) return res.status(400).json("Password does not matched");

    req.session.isAuth = true; //storing the session in DB
    req.session.user = {
      userId: userDb._id,
      username: userDb.username,
      email: userDb.email,
    };
    console.log(req.session.id);
    return res.redirect("/dashboard");
  } catch (error) {
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
});

app.post("/logout", isAuth, (req, res) => {
  console.log(req.session);
  req.session.destroy((err) => {
    if (err) return res.status(500).json("Logout unsuccessfull");

    return res.redirect("/login");
  });
});

app.post("/logout_from_all_devices", isAuth, async (req, res) => {
  console.log(req.session.user.username);

  const username = req.session.user.username;

  const sessionSchema = new Schema({ _id: String }, { strict: false });
  const sessionModel = mongoose.model("session", sessionSchema);
  try {
    const deleteDb = await sessionModel.deleteMany({
      "session.user.username": username,
    });
    console.log(deleteDb);
    return res.redirect("/login");
  } catch (error) {
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
});

app.get("/dashboard", isAuth, (req, res) => {
  return res.render("dashboard");
});

//create todo
app.post("/create-item", isAuth, async (req, res) => {
  console.log(req.body);
  const todoText = req.body.todo;
  const username = req.session.user.username;

  //data validation
  try {
    await todoDataValidation({ todo: todoText });
  } catch (error) {
    return res.send({
      status: 400,
      error: error,
    });
  }

  const todoObj = new todoModel({
    todo: todoText,
    username: username,
  });

  try {
    const todoDb = await todoObj.save();
    console.log(todoDb);
    return res.send({
      status: 201,
      message: "Todo created successfully",
      data: todoDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
});

//read todo
app.get("/read-item", isAuth, async (req, res) => {
  const username = req.session.user.username;
  try {
    const todoDb = await todoModel.find({ username: username });
    console.log(todoDb);

    if (todoDb.length === 0) {
      return res.send({
        status: 400,
        message: "No Todo Found",
      });
    }

    // return res.status(201).json({message : 'lafhbc', data : todoDb})
    return res.send({
      status: 200,
      message: "Read success",
      data: todoDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
});

//edit todo
app.post("/edit-item", isAuth, async (req, res) => {
  //id, newData, username

  const { todoId, newData } = req.body;
  const username = req.session.user.username;

  try {
    await todoDataValidation({ todo: newData });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 400,
      message: error,
    });
  }

  //find the todo
  //compare the owner
  //edit the todo

  try {
    const todoDb = await todoModel.findOne({ _id: todoId });
    console.log(todoDb);

    if (username !== todoDb.username) {
      return res.send({
        status: 403,
        message: "Not authorized to edit the todo",
      });
    }

    const prevTodo = await todoModel.findOneAndUpdate(
      { _id: todoId },
      { todo: newData }
    );

    return res.send({
      status: 200,
      message: "edit success",
      data: prevTodo,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Internals server error",
      error: error,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT:${PORT}`);
});
