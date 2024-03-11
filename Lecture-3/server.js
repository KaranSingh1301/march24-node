const express = require("express");

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.get("/", (req, res) => {
  console.log("get method working");
  return res.send("Server app is running");
});

//Queries
// /api?key=value

app.get("/api", (req, res) => {
  console.log(req.method, " ", req.url);
  console.log(req.query);
  const val = req.query.key;
  return res.send(`Query value : ${val}`);
});

//?key1=100&key2=200&key3=300
app.get("/api1", (req, res) => {
  console.log(req.query);
  return res.send(
    `Query values key1: ${req.query.key1}` + " " + `key2: ${req.query.key2}`
  );
});

// ?key=val1,val2
app.get("/api3", (req, res) => {
  console.log(req.query.key.split(","));
  const stringArray = req.query.key.split(",");
  const key1 = stringArray[0];
  const key2 = stringArray[1];
  return res.send(`Query values key1: ${key1}` + " " + `key2: ${key2}`);
});

// params
app.get("/profile/:id", (req, res) => {
  console.log(req.params.id);

  //   return res.status(200).json("all ok");

  return res.send({
    status: 200,
    param: req.params.id,
    message: "all ok",
  });
});

app.get("/user/:name/data", (req, res) => {
  console.log(req.params);

  //   return res.status(200).json("all ok");
  //   (res.status !== 200)(res.data.status !== 200);

  return res.send({
    status: 200,
    param: req.params.name,
    message: "all ok",
  });
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

app.post("/form_submit", (req, res) => {
  console.log(req.body);
  return res.send("Form submitted successfully");
});

app.listen(8000, () => {
  console.log("Server is running on PORT:8000");
});
