const express = require("express");

const app = express();
const PORT = process.env.PORT || 8000;

app.get("/home", (req, res) => {
  console.log(req);
  return res.send("/home api is wokring");
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT:${PORT}`);
});
