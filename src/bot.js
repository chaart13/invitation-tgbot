const { Bot, GrammyError, HttpError } = require("grammy");
const User = require("./utils");

const bot = new Bot(process.env.TG_BOT_TOKEN);

bot.command("start", async (ctx) => {
  try {
    await User.subscribe(ctx.from);
  } catch (error) {
    console.log(error);
    await ctx.reply("Can't subscribe");
    return;
  }
  await ctx.reply("Waiting for a slot to appear...");
});

bot.command("stop", async (ctx) => {
  try {
    await User.unsubscribe(ctx.from.id);
  } catch (error) {
    console.log(error);
    await ctx.reply("Can't unsubscribe");
    return;
  }
  await ctx.reply("Stopped");
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

module.exports = bot;
