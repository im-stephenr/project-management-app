const express = require("express");
const route = require("routes");
const app = express();

app.listen(5000, () => {
  console.log("Connected to port");
});
