const dbConnection = require("../config/dbConnection");
const { paginate } = require("../utils/paginate");
const { User, Email } = require("../config/associations");
const { Op } = require("sequelize");

// Pagination
const emailsPerPage = 5;

async function renderInboxPage(req, res) {
  const user = req.session.user;

  const { page, offset, totalPages } = await paginate(
    req,
    emailsPerPage,
    dbConnection,
    "receiver_id"
  );

  // Get the emails for the current page
  const [emails] = await dbConnection.execute(
    `SELECT emails.*, users.full_name AS sender_fullname 
    FROM emails 
    JOIN users ON emails.sender_id = users.id 
    WHERE receiver_id = ? 
    AND emails.is_deleted_by_recipient = 0
    ORDER BY sent_at DESC 
    LIMIT ? 
    OFFSET ?`,
    [user.id, emailsPerPage, offset]
  );

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
}

async function renderOutboxPage(req, res) {
  const user = req.session.user;

  const { page, offset, totalPages } = await paginate(
    req,
    emailsPerPage,
    dbConnection,
    "sender_id"
  );

  // Get the emails for the current page
  const [emails] = await dbConnection.execute(
    `SELECT emails.*, users.full_name AS receiver_fullname 
    FROM emails 
    JOIN users ON emails.receiver_id = users.id 
    WHERE sender_id = ? 
    AND emails.is_deleted_by_sender = 0
    ORDER BY sent_at DESC 
    LIMIT ? 
    OFFSET ?`,
    [user.id, emailsPerPage, offset]
  );

  //
  req.session.data = {
    emails: emails,
    currentPage: page,
    totalPages: totalPages,
  };

  res.render("emails/outbox", {
    success: null,
    error: null,
  });
}

async function renderEmailDetail(req, res) {
  const user = req.session.user;
  const email_id = req.params.email_id;

  // Fetch data
  const [email] = await dbConnection.execute(
    `
    SELECT emails.*, 
      sender.full_name AS sender_fullname, 
      receiver.full_name AS receiver_fullname
    FROM emails
    JOIN users AS sender ON emails.sender_id = sender.id
    JOIN users AS receiver ON emails.receiver_id = receiver.id
    WHERE emails.id = ?;
    `,
    [email_id]
  );

  req.session.data = { email: email[0] };

  return res.render("emails/detail", {
    error: null,
    success: null,
  });
}

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

    // Find emails and mark as deleted by sender or recipient based on the user's role
    const emails = await Email.findAll({
      where: {
        id: emailIds,
      },
    });

    const updateFields = emails.map((email) => {
      return {
        id: email.id,
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
        ],
      });

      console.log(receiver.SentEmails[0].subject);
    }
    // render to compose.ejs
    res.render("emails/compose", {
      error: null,
      receivers: users,
      receiver: receiver,
    });
  } catch (err) {
    console.log(err);
    res.render("emails/compose", {
      error: "An error has occured, please try again!",
      receiver: receiver,
      receivers: users,
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
      res.redirect("/compose", 500);
    }
    res.redirect("/outbox");
  } catch (err) {
    console.log(err);
    // redirect to 'emails/compose'
    res.render("emails/compose", {
      error: "Failed to send email, please try again",
    });
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
