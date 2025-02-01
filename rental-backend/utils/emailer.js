const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendReminderEmail = async (tenant) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: tenant.email,
    subject: `Rent Payment Reminder - Due ${tenant.due_date}`,
    html: `<p>Hi ${tenant.full_name},<br>
          Your rent payment of ₱${tenant.monthly_rent} is due on ${tenant.due_date}.<br>
          Current balance: ₱${tenant.monthly_rent}</p>`,
  };

  await transporter.sendMail(mailOptions);
};
