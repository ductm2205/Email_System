const express = require("express");
const router = express.Router();
const emailController = require("../controllers/emailsController");
const upload = require("../utils/upload");

router.get(["/", "/inbox"], emailController.renderInboxPage);

router.get("/outbox", emailController.renderOutboxPage);

router.get("/email/:email_id", emailController.renderEmailDetail);

router.delete("/email/delete/:email_id?", emailController.deleteEmailById);
router.delete("/api/email/delete", emailController.deleteMultipleEmails);

router.get("/compose/:receiver_id?", emailController.renderComposePage);
router.post("/email", upload.single("attachment"), emailController.sendEmail);

module.exports = router;
