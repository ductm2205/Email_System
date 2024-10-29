const mysql = require("mysql2/promise");
const { dbConfig } = require("../utils/dbConfig");

const dbConnection = mysql.createPool(dbConfig);

module.exports = dbConnection;
