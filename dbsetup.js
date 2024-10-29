const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

const { dbConfig, dbName } = require("./src/utils/dbConfig");

async function setupDatabase() {
  try {
    // create mysql connection
    const connection = await mysql.createConnection(dbConfig);

    // create database
    await connection.query(`DROP DATABASE IF EXISTS ${dbName}`);
    await connection.query(`CREATE DATABASE ${dbName}`);
    await connection.query(`USE ${dbName}`);

    // create users table
    await connection.query(`
            CREATE TABLE users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

    // create emails table
    await connection.query(`
            CREATE TABLE emails (
                id INT PRIMARY KEY AUTO_INCREMENT,
                sender_id INT NOT NULL,
                receiver_id INT NOT NULL,
                subject VARCHAR(200),
                body TEXT,
                attachment_path VARCHAR(255),
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_deleted_by_sender BOOLEAN DEFAULT FALSE,
                is_deleted_by_recipient BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (sender_id) REFERENCES users(id),
                FOREIGN KEY (receiver_id) REFERENCES users(id)
            )
        `);

    // initialize users
    const hashedPw = await bcrypt.hash("password123", 10);
    const usersData = [
      ["admin", "a@a.com", hashedPw],
      ["Nguyen Van B", "b@b.com", hashedPw],
      ["Tran Van C", "c@c.com", hashedPw],
    ];
    await connection.query(
      `
            INSERT INTO users (full_name, email, password)
            VALUES ?
        `,
      [usersData]
    );

    // initialize emails data
    // retrieve users data - {id, email}
    const [users] = await connection.query("SELECT id, email FROM users");
    // map users' email to their ids
    const userMap = {};
    users.forEach((user) => {
      userMap[user.email] = user.id;
    });

    // sample emails
    const emails = [
      [
        userMap["b@b.com"],
        userMap["a@a.com"],
        "Welcome!",
        "Welcome to our email system!",
        null,
      ],
      [userMap["c@c.com"], userMap["a@a.com"], "Hello", "How are you?", null],
      [
        userMap["a@a.com"],
        userMap["b@b.com"],
        "Re: Welcome!",
        "Thank you for the welcome!",
        null,
      ],
      [
        userMap["a@a.com"],
        userMap["c@c.com"],
        "Project update",
        "Here is the latest update...",
        null,
      ],
      [
        userMap["b@b.com"],
        userMap["c@c.com"],
        "Meeting tomorrow",
        "Can we meet tomorrow?",
        null,
      ],
      [
        userMap["c@c.com"],
        userMap["b@b.com"],
        "Re: Meeting tomorrow",
        "Yes, what time?",
        null,
      ],
      [
        userMap["b@b.com"],
        userMap["a@a.com"],
        "Weekend plans",
        "Any plans for the weekend?",
        null,
      ],
      [
        userMap["c@c.com"],
        userMap["a@a.com"],
        "Important notice",
        "Please check your calendar",
        null,
      ],
    ];

    await connection.query(
      `
            INSERT INTO emails (sender_id, receiver_id, subject, body, attachment_path)
            VALUES ?
        `,
      [emails]
    );

    console.log("Database setup completed successfully!");
    console.log(`Database '${dbName}' created with initial data.`);
    console.log("You can now run the application.");

    await connection.end();
  } catch (error) {
    console.error("Error setting up database:", error);
    process.exit(1);
  }
}

setupDatabase();
