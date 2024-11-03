const express = require("express");
const session = require("express-session");
const path = require("path");
const cookieParser = require("cookie-parser");
const layouts = require("express-ejs-layouts");
const fs = require("fs");

const methodOverride = require("method-override");

const { isAuthenticated } = require("./middlewares/authMiddleware");
const { layoutMiddleware } = require("./middlewares/layoutMiddleware");

const app = express();

// setup middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

// create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "/public/uploads/");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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
app.use(layouts);
// set static view templates folder
app.set("views", path.join(__dirname, "views"));

// setup routes
const auth = require("./routes/authRoutes");
const emails = require("./routes/emailsRoutes");

//
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});
app.use((req, res, next) => {
  res.locals.currentUrl = req.url;
  next();
});

app.use("/", auth);
app.use("/", isAuthenticated, layoutMiddleware, emails);

//
module.exports = app;
