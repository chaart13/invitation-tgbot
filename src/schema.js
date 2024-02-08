const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  id: { type: Number, required: true },
  username: { type: String, required: true },
  lastSeenDates: { type: String },
});

module.exports = model("Users", userSchema);
