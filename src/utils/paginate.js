async function paginate(req, emailsPerPage, dbConnection, target_user) {
  const user = req.session.user;

  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * emailsPerPage;

  // query only the emails that are not deleted
  let target;
  if (target_user == "sender_id") {
    target = "is_deleted_by_sender";
  }
  if (target_user === "receiver_id") {
    target = "is_deleted_by_recipient";
  }

  // Get the total count of emails for pagination calculation
  const [totalEmailsResult] = await dbConnection.execute(
    `
    SELECT COUNT(*) AS total 
    FROM emails 
    WHERE ${target_user} = ?
    AND emails.${target} = 0
    `,
    [user.id]
  );
  const totalEmails = totalEmailsResult[0].total;
  const totalPages = Math.ceil(totalEmails / emailsPerPage);

  return { page, offset, totalPages };
}

module.exports = { paginate };
