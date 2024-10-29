const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// signin
router.get("/signin", authController.renderSignInPage);
router.post("/signin", authController.signin);

// signup
router.get("/signup", authController.renderSignUpPage);
router.post("/signup", authController.signup);

// signout
router.post("/signout", authController.signout);



module.exports = router;
