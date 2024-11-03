const { Email } = require("../config/associations");

async function paginate(req, emailsPerPage, target_user) {
  const user = req.session.user;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * emailsPerPage;

  //
  let deletionColumn;
  if (target_user === "sender_id") {
    deletionColumn = "is_deleted_by_sender";
  } else if (target_user === "receiver_id") {
    deletionColumn = "is_deleted_by_recipient";
  } else {
    throw new Error("Invalid target_user value");
  }

  // Get the total count of emails for pagination calculation
  const totalEmails = await Email.count({
    where: {
      [target_user]: user.id,
      [deletionColumn]: false,
    },
  });

  const totalPages = Math.ceil(totalEmails / emailsPerPage);

  return { page, offset, totalPages };
}

module.exports = { paginate };
