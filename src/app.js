const express = require("express");
const session = require("express-session");
const multer = require("multer");
const path = require("path");
const cookieParser = require("cookie-parser");

const { isAuthenticated } = require("./middlewares/authMiddleware");

const app = express();

// setup middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// setup session
app.use(
  session({
    secret: "2205200329102024",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// setup ejs
app.set("view engine", "ejs");
// set static view templates folder
app.set("views", path.join(__dirname, "views"));

// setup routes
const auth = require("./routes/authRoutes");
const emails = require("./routes/emailsRoutes");

app.use("/", auth);
app.use("/", isAuthenticated, emails);

//
module.exports = app;
