require("dotenv").config();

const dbName = process.env.DB_NAME;

const dbConfig = {
  host: process.env.APP_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

module.exports = { dbConfig, dbName };
