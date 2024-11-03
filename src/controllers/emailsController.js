const { paginate } = require("../utils/paginate");
const { User, Email } = require("../config/associations");
const { Op } = require("sequelize");

// Pagination
const emailsPerPage = 10;

async function renderInboxPage(req, res) {
  const user = req.session.user;

  try {
    const { page, offset, totalPages } = await paginate(
      req,
      emailsPerPage,
      "receiver_id"
    );

    // Get the emails for the current page
    const emails = await Email.findAll({
      where: {
        receiver_id: user.id,
        is_deleted_by_recipient: false,
      },
      include: [
        {
          model: User,
          as: "Sender",
          attributes: ["full_name"],
        },
      ],
      order: [["sent_at", "DESC"]],
      limit: emailsPerPage,
      offset: offset,
    });

    // Save the data in session for reuse
    req.session.data = {
      emails: emails,
      currentPage: page,
      totalPages: totalPages,
    };

    // Render the inbox page with pagination data
    res.render("emails/inbox", {
      success: null,
      error: null,
    });
  } catch (err) {
    console.log(err);
    res.render("error", {
      success: null,
      error: "Failed to process, please try again!",
    });
  }
}

async function renderOutboxPage(req, res) {
  const successMessage = req.query.success ? req.query.success : null;
  const user = req.session.user;
  try {
    const { page, offset, totalPages } = await paginate(
      req,
      emailsPerPage,
      "sender_id"
    );

    // Get the emails for the current page
    const emails = await Email.findAll({
      where: {
        sender_id: user.id,
        is_deleted_by_sender: false,
      },
      include: [
        {
          model: User,
          as: "Receiver",
          attributes: ["full_name"],
        },
      ],
      order: [["sent_at", "DESC"]],
      limit: emailsPerPage,
      offset: offset,
    });

    //
    req.session.data = {
      emails: emails,
      currentPage: page,
      totalPages: totalPages,
    };

    res.render("emails/outbox", {
      success: successMessage,
      error: null,
    });
  } catch (err) {
    console.log(err);
    res.render("error", {
      error: "Failed to process, please try again!",
    });
  }
}

async function renderEmailDetail(req, res) {
  const email_id = req.params.email_id;

  try {
    // Fetch data
    const email = await Email.findOne({
      where: { id: email_id },
      include: [
        {
          model: User,
          as: "Sender",
          attributes: ["full_name"],
        },
        {
          model: User,
          as: "Receiver",
          attributes: ["full_name"],
        },
      ],
    });

    req.session.data = { email: email };

    return res.render("emails/detail", {
      error: null,
      success: null,
    });
  } catch (error) {
    console.log(error);
    res.render("error", {
      error: "Failed to process, please try again!",
    });
  }
}

async function renderComposePage(req, res) {
  // Get the curr user
  const user = req.session.user;

  // Check if Replying to a mail
  const receiver_id = req.params.receiver_id;

  let receiver;
  let users;

  try {
    // if not replying
    if (!receiver_id) {
      // Get all the other users
      users = await User.findAll({
        where: {
          id: {
            [Op.ne]: user.id,
          },
        },
      });
    } else {
      receiver = await User.findByPk(receiver_id, {
        include: [
          {
            model: Email,
            as: "SentEmails",
            where: { id: req.session.data.email.id },
            required: false,
          },
          {
            model: Email,
            as: "ReceivedEmails",
            where: { id: req.session.data.email.id },
            required: false,
          },
        ],
      });
    }
    // render to compose.ejs
    res.render("emails/compose", {
      error: req.query.error ? req.query.error : null,
      receivers: users,
      receiver: receiver,
    });
  } catch (err) {
    console.log(err);
    res.render("emails/compose", {
      error: "An error has occured, please try again!",
      receiver: receiver || [],
      receivers: users || [],
    });
  }
}

async function sendEmail(req, res) {
  // get the user
  const user = req.session.user;

  // get the path of the file
  const attachmentPath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    // create new Email
    const newEmail = await Email.create({
      sender_id: user.id,
      receiver_id: parseInt(req.body.receiver_id),
      subject: req.body.subject,
      body: req.body.body,
      attachment_path: attachmentPath,
      is_deleted_by_sender: false,
      is_deleted_by_recipient: false,
    });

    // redirect to the outbox

    if (!newEmail) {
      res.redirect(
        "/compose?error=Failed%20to%20create%20new%20email,%20please%20try%20again!"
      );
    }
    res.status(200);
    res.redirect("/outbox?success=Email%20sent%20successfully!");
  } catch (err) {
    console.log(err);
    // redirect to 'emails/compose'
    res.render("emails/compose", {
      error: "Failed to send email, please try again",
    });
  }
}

/** DELETE APIs */
async function deleteEmailById(req, res) {
  try {
    const user = req.session.user;
    const email_id = req.params.email_id;

    // Get the target email
    const email = await Email.findOne({
      where: {
        id: email_id,
      },
    });

    // If email not found
    if (!email) {
      return res.status(404).json({ error: "Email not found" });
    }

    // Check if current user is the sender or the receiver
    const updateField =
      user.id === email.sender_id
        ? { is_deleted_by_sender: true }
        : { is_deleted_by_recipient: true };

    // Update the target field to mark email as deleted
    const [updateRes] = await Email.update(updateField, {
      where: {
        id: email_id,
      },
    });

    if (!updateRes) {
      return res.status(500).json({ error: "Failed to delete email" });
    }

    // Update session data after deletion
    if (req.session.data && req.session.data.emails) {
      req.session.data.emails = req.session.data.emails.filter(
        (email) => email.id !== parseInt(email_id)
      );
    }

    // Send a success response to the client
    res.status(200).json({ success: "Email deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the email" });
  }
}

async function deleteMultipleEmails(req, res) {
  try {
    const user = req.session.user;
    const emailIds = req.body.emailIds;

    if (!emailIds || emailIds.length === 0) {
      return res.status(400).json({ error: "No emails selected for deletion" });
    }

    // Fetch emails
    const emails = await Email.findAll({
      where: {
        id: emailIds,
      },
    });

    const updateFields = emails.map((email) => {
      return {
        id: email.id,
        // Check whether the current user is sender or receiver
        updateField:
          user.id === email.sender_id
            ? { is_deleted_by_sender: true }
            : { is_deleted_by_recipient: true },
      };
    });

    // Perform updates in batch
    await Promise.all(
      updateFields.map((field) =>
        Email.update(field.updateField, {
          where: {
            id: field.id,
          },
        })
      )
    );

    // Update session data
    if (req.session.data && req.session.data.emails) {
      req.session.data.emails = req.session.data.emails.filter(
        (email) => !emailIds.includes(email.id.toString())
      );
    }

    res.status(200).json({ success: "Selected emails deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the emails" });
  }
}

module.exports = {
  renderInboxPage,
  renderOutboxPage,
  renderEmailDetail,
  deleteEmailById,
  deleteMultipleEmails,
  renderComposePage,
  sendEmail,
};
