const dbConnection = require("../config/dbConnection");

async function isAuthenticated(req, res, next) {
  const userId = req.session.user?.id;

  if (!userId) {
    return res.redirect("/signin");
  }

  try {
    const [users] = await dbConnection.query(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      res.session.destroy();
      return res.redirect("/signin");
    }
    req.user = users[0];

    next();
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = { isAuthenticated };
