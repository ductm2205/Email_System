const dbConnection = require("../config/dbConnection");

async function renderInboxPage(req, res) {
  res.render("emails/inbox");
}

module.exports = { renderInboxPage };
