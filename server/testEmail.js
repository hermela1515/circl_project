router.get("/send", async (req, res) => {
  try {
    await transporter.sendMail({
      from: `"Circl" <${process.env.EMAIL_USER}>`,
      to: "YOUR_OTHER_EMAIL@gmail.com",
      subject: "Circl test email",
      text: "This is a test email from Circl.",
    });

    res.json({
      success: true,
      message: "Test email sent successfully",
    });
  } catch (error) {
    console.error("Test email error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});