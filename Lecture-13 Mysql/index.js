const express = require("express");
const mysql = require("mysql");

const app = express();

app.use(express.json());

//db connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Karan@130101",
  database: "tododb",
  multipleStatements: true,
});

db.connect((err) => {
  if (err) console.log(err);
  // db.query("CREATE DATABASE tododb", function(err, result){
  //     if(err) throw err;
  //     console.log("Database created")
  // })

  console.log("Mysql database has been connected");
});

app.get("/", (req, res) => {
  return res.send("Server is running");
});

app.get("/get-user", (req, res) => {
  db.query("SELECT * FROM user", {}, (err, data) => {
    console.log(data);

    if (err) return res.status(500).json("Database error");

    return res.status(200).json(data);
  });
});

app.post("/create-user", async (req, res) => {
  const { user_id, name, email, password } = req.body;

  db.query(
    `INSERT INTO user (user_id, name, email, password) VALUES (?,?,?,?)`,
    [user_id, name, email, password],
    (err, data) => {
      console.log(data);
      console.log(err);
      if (err) return res.status(500).json("Database error");

      return res.status(200).json("User created successfully");
    }
  );
});

app.listen(8000, () => {
  console.log("Server is running on PORT:8000");
});
