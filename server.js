require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const users = require("./routes/api/users");
const passport = require("passport");
const bodyParser = require("body-parser");

const app = express();

//Adding middlerware to express app
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

//Config Keys
const db = require("./config/keys").mongoURI;

//Connect to MongoDB using Mongoose
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err, "Error"));

//Adding passport middleware
app.use(passport.initialize());

//Passport Config
require("./config/passport")(passport);

// Routes APIs
app.use("/api/users", users);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Running server on Port ${PORT}`));
