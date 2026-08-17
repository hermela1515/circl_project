require("dotenv").config();

console.log("========== EMAIL DEBUG ==========");
console.log("EMAIL_USER:", process.env.EMAIL_USER || "MISSING");
console.log(
  "EMAIL_PASS:",
  process.env.EMAIL_PASS ? "FOUND" : "MISSING"
);
console.log("=================================");


require("dotenv").config();

const nodemailer = require("nodemailer");

console.log(
  "Email user:",
  process.env.EMAIL_USER ? "FOUND" : "MISSING"
);

console.log(
  "Email password:",
  process.env.EMAIL_PASS ? "FOUND" : "MISSING"
);

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (
  email,
  username,
  verificationToken
) => {
  const verificationUrl =
    `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

  await transporter.sendMail({
    from: `"Circl" <${process.env.EMAIL_USER}>`,

    to: email,

    subject: "Verify your Circl account",

    html: `
      <!DOCTYPE html>
      <html>
        <body style="
          margin: 0;
          padding: 40px;
          background: #15121F;
          font-family: Arial, sans-serif;
        ">

          <div style="
            max-width: 600px;
            margin: auto;
            padding: 40px;
            background: #1E1A2E;
            border-radius: 24px;
            color: #F5F1EA;
          ">

            <h1 style="
              color: #FF5C7C;
              margin-bottom: 20px;
            ">
              Welcome to Circl 🎉
            </h1>

            <p style="
              color: #ABA3C4;
              font-size: 16px;
            ">
              Hi ${username},
            </p>

            <p style="
              color: #ABA3C4;
              font-size: 16px;
              line-height: 1.6;
            ">
              Thanks for creating your Circl account.
              Please verify your email address to continue.
            </p>

            <div style="margin: 30px 0;">

              <a
                href="${verificationUrl}"
                style="
                  display: inline-block;
                  padding: 14px 28px;
                  background: #FF5C7C;
                  color: #15121F;
                  text-decoration: none;
                  border-radius: 30px;
                  font-weight: bold;
                "
              >
                Verify my email
              </a>

            </div>

            <p style="
              color: #6F6982;
              font-size: 13px;
            ">
              This verification link expires in 24 hours.
            </p>

          </div>

        </body>
      </html>
    `,
  });
};

module.exports = {
  transporter,
  sendVerificationEmail,
};