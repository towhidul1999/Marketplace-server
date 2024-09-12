const nodemailer = require("nodemailer");
const config = require("../config/config");
const logger = require("../config/logger");

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== "test") {
  transport
    .verify()
    .then(() => logger.info("Connected to email server"))
    .catch((err) =>
      logger.warn(
        "Unable to connect to email server. Make sure you have configured the SMTP options in .env"
      )
    );
}

const sendEmail = async (to, subject, html) => {
  const msg = { from: config.email.from, to, subject, html };
  await transport.sendMail(msg);
};

const sendEmailVerification = async (to, otp) => {
  const subject = "User verification code";
  const html = `
 <body style="background-color: #f3f4f6; padding: 2rem; font-family: Arial, sans-serif; color: #333;">
  <div style="max-width: 30rem; margin: 0 auto; background-color: #ffffff; padding: 2rem; border-radius: 0.75rem; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15); text-align: center;">
    <img src="https://i.ibb.co/99DDJ34/Property-1-Logo-Mark-1.png" alt="Cnnctr Logo" style="max-width: 10rem; margin-bottom: 1.5rem;">
    <h1 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 1rem; color: #1f2937;">Welcome to Cnnctr</h1>
    <p style="color: #4b5563; margin-bottom: 1.5rem;">Thank you for joining Cnnctr! Your account is almost ready.</p>
    <div style="background: linear-gradient(135deg, #3b82f6, #06b6d4); color: #ffffff; padding: 1rem; border-radius: 0.5rem; font-size: 2rem; font-weight: 800; letter-spacing: 0.1rem; margin-bottom: 1.5rem;">
      ${otp}
    </div>
    <p style="color: #4b5563; margin-bottom: 1.5rem;">Enter this code to verify your account.</p>
    <p style="color: #6b7280; font-size: 0.875rem; margin-top: 1.5rem;">If you did not request this verification, please ignore this email.</p>
    <p style="color: #6b7280; font-size: 0.875rem;">Thanks, The Cnnctr Team</p>
    <p style="color: #ff0000; font-size: 0.85rem; margin-top: 1.5rem;">This code expires in <span id="timer">3:00</span> minutes.</p>
  </div>
</body>
`;
  await sendEmail(to, subject, html);
};

const sendResetPasswordEmail = async (to, otp) => {
  const subject = "Password Reset Email";
  const html = `
  <body style="background-color: #f3f4f6; padding: 1rem; font-family: Arial, sans-serif;">
    <div style="max-width: 24rem; margin: 0 auto; background-color: #fff; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <h1 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem;">Password Reset</h1>
      <p style="color: #4b5563; margin-bottom: 1rem;">You have requested a password reset. Here is your reset code:</p>
      <div style="background-color: #e5e7eb; padding: 1rem; border-radius: 0.25rem; text-align: center; font-size: 2rem; font-weight: 700; margin-bottom: 1rem;">${otp}</div>
      <p style="color: #4b5563; margin-bottom: 1rem;">Please enter this code to reset your password.</p>
      <p style="color: red; margin-bottom: 1rem;">This code is valid for 3 minutes.</p>
    </div>
  </body>
  `;
  await sendEmail(to, subject, html);
};

const sendVerificationEmail = async (to, token) => {
  const subject = "Email Verification";
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `http://link-to-app/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendEmailVerification,
};
