const express = require("express");
const router = express.Router();
const emailController = require("../controllers/emailsController");

router.get(["/", "/inbox"], emailController.renderInboxPage);

router.get("/outbox", emailController.renderOutboxPage);

router.get("/email/:email_id", emailController.renderEmailDetail);

router.delete("/email/delete/:email_id?", emailController.deleteEmailById);
router.delete("/api/email/delete", emailController.deleteMultipleEmails);

module.exports = router;
