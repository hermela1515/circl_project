const nodemailer = require("nodemailer");

const emailUser = process.env.EMAIL_USER?.trim();
const emailPass = process.env.EMAIL_PASS?.trim();

console.log("========================================");
console.log("MAILER CONFIG");
console.log("EMAIL USER:", emailUser);
console.log("PASSWORD EXISTS:", Boolean(emailPass));
console.log("PASSWORD LENGTH:", emailPass?.length);
console.log("========================================");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("========================================");
    console.error("❌ SMTP CONNECTION FAILED");
    console.error(error);
    console.error("========================================");
  } else {
    console.log("========================================");
    console.log("✅ SMTP CONNECTION SUCCESSFUL");
    console.log("========================================");
  }
});

module.exports = transporter;