const express = require("express");
const route = require("routes");
const bodyParser = require("body-parser");
const HttpError = require("./models/http-error");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.json());

// allow the front end to access uploads/images folder
app.use("/uploads/images", express.static(path.join("uploads", "images")));

// Allows us to communicate between different domain
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // * means allow any domain to access
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

// Routes
const userRoutes = require("./routes/users-routes");
const projectRoutes = require("./routes/projects-routes");

// Router to controller
app.use("/api/users/", userRoutes);
app.use("/api/projects/", projectRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Count not find route", 404);
  throw error;
});

// if parameter is 4, express will recognize this as a special middleware, as a error middleware
// this is used to stop uploading a file if there's validation error
app.use((error, req, res, next) => {
  // if there is a file
  if (req.file) {
    // remove the file if signup is not successfully
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headersSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});

// connect db
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gudqyrg.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    // connect port
    app.listen(5000, () => {
      console.log("Connected to port");
    });
  })
  .catch((err) => console.log("DB Connection Error", err));
