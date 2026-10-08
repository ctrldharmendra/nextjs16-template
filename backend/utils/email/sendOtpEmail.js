const nodemailer = require("nodemailer");
const { buildOtpEmailHtml } = require("./otpEmailTemplate");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendOtpEmail = async ({ to, otp }) => {
  const info = await transporter.sendMail({
    from: `"Dharmendra Thakur" <${process.env.GMAIL_USER}>`,
    to,
    subject: "OTP For Signup",
    html: buildOtpEmailHtml({
      otp,
      logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTD-S-n12TasTD2IQOxmftQWhZ3phZUosFxozVp1-IY-Q&s=10",
    }),
  });

  return info;
};

module.exports = {
  sendOtpEmail,
};