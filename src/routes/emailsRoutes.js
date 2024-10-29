const express = require("express");
const router = express.Router();
const emailController = require("../controllers/emailsController");

router.get("/inbox", emailController.renderInboxPage);

module.exports = router;
