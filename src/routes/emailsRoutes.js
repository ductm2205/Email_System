const express = require("express");
const router = express.Router();
const emailController = require("../controllers/emailsController");

router.get(["/", "/inbox"], emailController.renderInboxPage);

router.get("/outbox", emailController.renderOutboxPage);

router.get("/email/:email_id", emailController.renderEmailDetail);

module.exports = router;
