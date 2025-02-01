const cron = require("node-cron");
const { sendReminders } = require("../controllers/notification");

// Run daily at 9 AM
cron.schedule("0 9 * * *", async () => {
  console.log("Running rent reminders...");
  const result = await sendReminders();
  console.log(result.message);
});
