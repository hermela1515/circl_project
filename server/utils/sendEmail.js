const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

  await transporter.sendMail({
    from: `"Circl" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your Circl account",

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        padding: 40px;
        background: #15121F;
        color: #F5F1EA;
        border-radius: 20px;
      ">

        <h1 style="color: #FF5C7C;">
          Welcome to Circl
        </h1>

        <p>
          Thanks for creating your Circl account.
        </p>

        <p>
          Please verify your email address by clicking
          the button below.
        </p>

        <a
          href="${verificationUrl}"
          style="
            display: inline-block;
            padding: 14px 24px;
            background: #FF5C7C;
            color: #15121F;
            text-decoration: none;
            border-radius: 30px;
            font-weight: bold;
            margin-top: 20px;
          "
        >
          Verify my email
        </a>

        <p style="
          margin-top: 30px;
          color: #ABA3C4;
          font-size: 13px;
        ">
          This verification link expires in 24 hours.
        </p>

      </div>
    `,
  });
};

module.exports = {
  sendVerificationEmail,
};