const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("wpr2101040063", "wpr", "fit2024", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;
