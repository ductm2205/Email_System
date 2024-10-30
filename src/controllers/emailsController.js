const dbConnection = require("../config/dbConnection");

async function renderInboxPage(req, res) {
  // get the user
  const user = req?.session.user;

  // get the messages received by current user
  const [emails] = await dbConnection.execute(
    "SELECT * FROM emails WHERE sender_id = ?",
    [user.id]
  );

  // return
  res.render("emails/inbox", { user: user, emails: emails });
}

async function renderOutboxPage(req, res) {
  const user = req.session.user ? req.session.user : null;

  const [emails] = await dbConnection.execute(
    "select * from emails where receiver_id = ?",
    [user.id]
  );

  res.render("emails/outbox", { user: user, emails: emails });
}

module.exports = { renderInboxPage, renderOutboxPage };
