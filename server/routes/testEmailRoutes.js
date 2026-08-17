const express = require("express");
const transporter = require("../config/mailer");

const router = express.Router();

router.get("/send-test", async (req, res) => {
  try {
    const testEmail = req.query.email;

    if (!testEmail) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email address",
      });
    }

    const info = await transporter.sendMail({
      from: `"Circl" <${process.env.EMAIL_USER}>`,
      to: testEmail,
      subject: "Circl test email",
      text: "This is a test email from your Circl backend.",
      html: `
        <h2>Circl Email Test</h2>
        <p>If you received this email, Gmail/Nodemailer is working correctly.</p>
      `,
    });

    console.log("TEST EMAIL SENT:");
    console.log(info);

    res.status(200).json({
      success: true,
      message: "Test email sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("TEST EMAIL ERROR:");
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: error.message,
    });
  }
});

module.exports = router;