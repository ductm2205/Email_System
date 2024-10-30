const express = require("express");
const router = express.Router();
const emailController = require("../controllers/emailsController");

router.get(["/", "/inbox"], emailController.renderInboxPage);

router.get("/outbox", emailController.renderOutboxPage);

module.exports = router;
