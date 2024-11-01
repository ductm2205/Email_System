const dbConnection = require("../config/dbConnection");
const { paginate } = require("../utils/paginate");

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
  req.session.inboxData = {
    emails,
    currentPage: page,
    totalPages,
  };

  // Render the inbox page with pagination data
  res.render("emails/inbox", {
    user: user,
    emails: emails,
    currentPage: page,
    totalPages: totalPages,
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

  res.render("emails/outbox", {
    user: user,
    emails: emails,
    currentPage: page,
    totalPages: totalPages,
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

  return res.render("emails/detail", {
    user: user,
    email: email[0],
    error: null,
    success: null,
  });
}

async function deleteEmailById(req, res) {
  const user = req.session.user;
  const email_id = req.params.email_id;

  // determine if the current user is sender or receiver
  const [email] = await dbConnection.execute(
    `SELECT sender_id, receiver_id
    FROM emails
    WHERE emails.id = ?`,
    [email_id]
  );

  if (!email) {
  }

  let updatedField =
    email.sender_id === user.id
      ? "is_deleted_by_sender"
      : "is_deleted_by_recipient";

  const [isDeleted] = await dbConnection.execute(
    `UPDATE emails SET ${updatedField} = 1 WHERE emails.id = ?`,
    [email_id]
  );

  if (!isDeleted) {
    return res.render("email/detail", {
      error: "Something went wrong!",
      success: null,
    });
  }

  // Update session data after deletion
  if (req.session.inboxData) {
    req.session.inboxData.emails = req.session.inboxData.emails.filter(
      (email) => email.id !== parseInt(email_id)
    );
  }

  // Redirect to inbox
  res.redirect("/inbox");
}

module.exports = {
  renderInboxPage,
  renderOutboxPage,
  renderEmailDetail,
  deleteEmailById,
};
