const UsersModel = require("./schema");

class Job {
  static interval = null;
  static API_BASE =
    "https://www.e-uslugi.mazowieckie.pl/delegate/services/guest/subjects/176/timeframes";

  static async _callAPI() {
    let res = await fetch(
      `${this.API_BASE}/${new Date().toLocaleDateString("sv")}/next/date`,
      { method: "GET" }
    );
    if (!res.ok) {
      return;
    }
    const timestamp = await res.json();
    console.log(timestamp);

    res = await fetch(`${API_BASE}/${timestamp.substring(0, 10)}`, {
      method: "GET",
    });
    const times = await res.json();
    return times.map((time) => time.dateFrom);
  }

  static createJob() {
    if (this.interval) {
      return;
    }

    this.interval = setInterval(async () => {
      const dates = await this._callAPI();
      //   const dates = ["2024-01-19 09:00:00", "2024-01-19 11:00:00"];
      if (dates?.length) {
        User.pushNotifications(dates);
      }
    }, 1000);
  }

  static deleteJob() {
    this.interval = clearInterval(this.interval);
  }
}

class User {
  static usersBuffer;
  static bot;
  static RESERVATION_URL =
    "https://www.e-uslugi.mazowieckie.pl/umow-wizyte#/visit-selection";

  static async init(bot) {
    this.bot = bot;
    try {
      const users = await UsersModel.find().exec();
      this.usersBuffer = users.map((user) => ({
        id: user.id,
        lastSeenDates: user.lastSeenDates,
      }));
      if (this.usersBuffer.length) {
        Job.createJob();
      }
    } catch (error) {
      console.log(error);
    }
  }

  static async subscribe(user) {
    const { id, username } = user;

    const dbUser = await UsersModel.findOne({ id }).exec();
    if (!dbUser) {
      await UsersModel.create({ id, username });
      this.usersBuffer.push({ id });
    }
    Job.createJob();
  }

  static async unsubscribe(userId) {
    await UsersModel.findOneAndDelete({ id: userId });

    this.usersBuffer = this.usersBuffer.filter((user) => user.id !== userId);

    if (!this.usersBuffer.length) {
      Job.deleteJob();
    }
  }

  static pushNotifications(dates) {
    const promises = [];
    const datesString = dates.join("\n");
    this.usersBuffer.forEach((user) => {
      if (datesString === user.lastSeenDates) {
        return;
      }
      user.lastSeenDates = datesString;
      promises.push(
        UsersModel.updateOne({ id: user.id }, { lastSeenDates: datesString })
      );

      const message = `Dates found:\n\n${datesString}\n\n<a href="${this.RESERVATION_URL}">Book now!</a>`;
      promises.push(
        this.bot.api.sendMessage(user.id, message, {
          parse_mode: "HTML",
        })
      );
    });

    if (promises.length) {
      Promise.allSettled(promises);
    }
  }
}

module.exports = User;
