const express = require("express");
const mongoose = require("mongoose");
const userModel = require("./userSchema");

const app = express();
const MONGO_URI = `mongodb+srv://karan:12345@cluster0.22wn2.mongodb.net/marchTestDB`;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

app.get("/get-form", (req, res) => {
  return res.send(`
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    </head>
    <body>
        <h1>User form</h1>
        <form action="/form_submit" method="POST">
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

app.post("/form_submit", async (req, res) => {
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
      message: "User created successfully",
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

app.listen(8000, () => {
  console.log("Server is running on PORT:8000");
});
