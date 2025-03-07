const dbConnection = require("../config/dbConnection");
const User = require("../models/User.js");

async function isAuthenticated(req, res, next) {
  const userId = req.session.user?.id;

  if (!userId) {
    return res.redirect("/signin");
  }

  try {
    // Use Sequelize finder
    const user = await User.findByPk(userId);

    if (!user) {
      req.session.destroy();
      return res.redirect("/signin");
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = { isAuthenticated };
