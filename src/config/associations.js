const User = require("../models/User");
const Email = require("../models/Email");

// Define associations
User.hasMany(Email, { as: "SentEmails", foreignKey: "sender_id" });
User.hasMany(Email, { as: "ReceivedEmails", foreignKey: "receiver_id" });
Email.belongsTo(User, { as: "Sender", foreignKey: "sender_id" });
Email.belongsTo(User, { as: "Receiver", foreignKey: "receiver_id" });

module.exports = { User, Email };
