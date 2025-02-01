const nodemailer = require("nodemailer");
const pool = require("../config/db");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// exports.sendReminders = async () => {
//   try {
//     // Get tenants with due dates in next 3 days
//     const { rows } = await pool.query(`
//       SELECT * FROM tenants
//       WHERE due_date BETWEEN EXTRACT(DAY FROM NOW()) + 1
//       AND EXTRACT(DAY FROM NOW()) + 3
//     `);

//     // Send emails
//     await Promise.all(
//       rows.map(async (tenant) => {
//         const mailOptions = {
//           from: process.env.EMAIL_USER,
//           to: tenant.email,
//           subject: "Rent Payment Reminder",
//           html: `<p>Hi ${tenant.full_name},<br>
//               This is a reminder that your rent payment of ₱${tenant.monthly_rent}<br>
//               is due on ${tenant.due_date} of this month.</p>`,
//         };

//         await transporter.sendMail(mailOptions);
//       })
//     );

//     return { success: true, message: `${rows.length} reminders sent` };
//   } catch (error) {
//     return { success: false, error: error.message };
//   }
// };

exports.sendReminders = async () => {
  try {
    const { rows } = await pool.query(`
        SELECT * FROM tenants 
        WHERE 
          is_active = TRUE AND
          receive_notifications = TRUE AND
          due_date = EXTRACT(DAY FROM CURRENT_DATE + INTERVAL '3 days')
      `);

    await Promise.all(rows.map((tenant) => sendReminderEmail(tenant)));
    return { success: true, sent: rows.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
