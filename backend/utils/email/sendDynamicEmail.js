const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendDynamicEmail = async ({
  to,
  subject = "Dudhkoshi Hydropower",
  body,
}) => {
  if (!body) {
    throw new Error("Email body is required");
  }

  const info = await transporter.sendMail({
    from: `"Dudhkoshi Hydropower" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html: body,
  });

  return info;
};

module.exports = {
  sendDynamicEmail,
};