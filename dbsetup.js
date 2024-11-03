const sequelize = require("./src/config/sequelize");
const User = require("./src/models/User");
const Email = require("./src/models/Email");
const bcrypt = require("bcrypt");

async function setupDatabase() {
  try {
    // Sync database schema
    await sequelize.sync({ force: true });

    // Seed initial users
    const hashedPw = await bcrypt.hash("password123", 10);
    const users = await User.bulkCreate([
      { full_name: "admin", email: "a@a.com", password: hashedPw },
      { full_name: "Nguyen Van B", email: "b@b.com", password: hashedPw },
      { full_name: "Tran Van C", email: "c@c.com", password: hashedPw },
      { full_name: "Tran Van D", email: "d@d.com", password: hashedPw },
      { full_name: "Tran Van E", email: "e@e.com", password: hashedPw },
    ]);

    // Seed initial emails
    const emails = [
      {
        sender_id: users[1].id,
        receiver_id: users[0].id,
        subject: "Welcome!",
        body: "Welcome to our email system!",
      },
      {
        sender_id: users[2].id,
        receiver_id: users[0].id,
        subject: "Hello",
        body: "How are you?",
      },
      {
        sender_id: users[0].id,
        receiver_id: users[1].id,
        subject: "Re: Welcome!",
        body: "Thank you for the welcome!",
      },
      {
        sender_id: users[0].id,
        receiver_id: users[2].id,
        subject: "Project update",
        body: "Here is the latest update...",
      },
      {
        sender_id: users[1].id,
        receiver_id: users[2].id,
        subject: "Meeting tomorrow",
        body: "Can we meet tomorrow?",
      },
      {
        sender_id: users[2].id,
        receiver_id: users[1].id,
        subject: "Re: Meeting tomorrow",
        body: "Yes, what time?",
      },
      {
        sender_id: users[1].id,
        receiver_id: users[0].id,
        subject: "Weekend plans",
        body: "Any plans for the weekend?",
      },
      {
        sender_id: users[2].id,
        receiver_id: users[0].id,
        subject: "Important notice",
        body: "Please check your calendar",
      },
      {
        sender_id: users[2].id,
        receiver_id: users[0].id,
        subject: "Meeting Reminder",
        body: "Don't forget about the team meeting tomorrow at 10 AM.",
      },
      {
        sender_id: users[3].id,
        receiver_id: users[0].id,
        subject: "Project Update",
        body: "The project is on track! We'll reach out with the next steps soon.",
      },
      {
        sender_id: users[4].id,
        receiver_id: users[0].id,
        subject: "Discount Alert!",
        body: "Enjoy a 20% discount on your next purchase. Limited time offer!",
      },
      {
        sender_id: users[1].id,
        receiver_id: users[0].id,
        subject: "Feedback Request",
        body: "We would love to hear your feedback on our recent product update.",
      },
      {
        sender_id: users[2].id,
        receiver_id: users[0].id,
        subject: "Social Event",
        body: "Join us for a virtual social event this Friday at 6 PM. RSVP required.",
      },
      {
        sender_id: users[3].id,
        receiver_id: users[0].id,
        subject: "Security Notice",
        body: "Your account password will expire soon. Please update it at your earliest convenience.",
      },
      {
        sender_id: users[4].id,
        receiver_id: users[0].id,
        subject: "Weekly Newsletter",
        body: "Catch up on the latest news and updates in our weekly newsletter!",
      },
      {
        sender_id: users[1].id,
        receiver_id: users[0].id,
        subject: "Welcome to the Team!",
        body: "Congratulations on joining the team! We’re excited to work with you.",
      },
    ];

    // Create emails table
    await Email.bulkCreate(emails);

    console.log("Database setup completed successfully!");
    console.log("You can now run the application.");
  } catch (error) {
    console.error("Error setting up database:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

setupDatabase();
