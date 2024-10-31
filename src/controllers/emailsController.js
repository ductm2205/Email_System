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

  // Render the inbox page with pagination data
  res.render("emails/inbox", {
    user: user,
    emails: emails,
    currentPage: page,
    totalPages: totalPages,
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
  });
}

async function renderEmailDetail(req, res) {
  const user = req.session.user;
  const email_id = req.params.email_id;

  // Fetch data
  const [email] = await dbConnection.execute(
    `SELECT * 
    FROM emails
    WHERE emails.id = ?`,
    [email_id]
  );

  return res.render("emails/detail", { email: email[0] });
}

module.exports = { renderInboxPage, renderOutboxPage, renderEmailDetail };
