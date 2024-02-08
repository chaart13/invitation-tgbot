require("dotenv").config();
const bot = require("./src/bot");
const mongoose = require("mongoose");
const User = require("./src/utils");

mongoose
  .connect(process.env.MONGO_CONNECTION)
  .then(async () => {
    console.log("Connected to DB");
    await User.init(bot);
    bot.start();
  })
  .catch(console.error);
