require("dotenv").config();
const bot = require("./src/bot");
const mongoose = require("mongoose");
const express = require("express");
const User = require("./src/utils");

const app = express();

mongoose
  .connect(process.env.MONGO_CONNECTION)
  .then(async () => {
    console.log("Connected to DB");
    await User.init(bot);
    bot.start();
  })
  .catch(console.error);

app.get("/", (req, res) => {
  res.send("Dummy response");
});

app.listen(3000, () => console.log("Listening.."));
