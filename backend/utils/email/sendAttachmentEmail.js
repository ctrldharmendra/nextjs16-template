const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendAttachmentEmail = async ({
  to,
  subject = "Dudhkoshi Hydropower",
  body,
  attachments = [],
}) => {
  const info = await transporter.sendMail({
    from: `"Dudhkoshi Hydropower" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html: body,
    attachments,
  });

  return info;
};

module.exports = {
  sendAttachmentEmail,
};