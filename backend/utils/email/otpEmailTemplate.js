function buildOtpEmailHtml({
  otp,
  logoUrl,
  logoAlt = "Dudhkoshi Hydropower",
  preheader = "Your Password Reset OTP",
  expiryMinutes = 10,
}) {
  const year = new Date().getFullYear();

  const logoBlock = logoUrl
    ? `<img src="${logoUrl}" alt="${logoAlt}" width="140" style="display:block;margin:0 auto;max-width:140px;" />`
    : `<div style="display:inline-block;background:#4F46E5;color:#fff;font-size:20px;font-weight:700;padding:10px 22px;border-radius:10px;">${logoAlt}</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>Password Reset OTP</title>
</head>

<body style="margin:0;padding:0;background:#F3F4F6;">

${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ""}

<table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;padding:40px 16px;">
<tr>
<td align="center">

<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;box-shadow:0 1px 4px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06);overflow:hidden;">

<tr>
<td style="background:linear-gradient(135deg,#4F46E5,#7C3AED);height:5px;"></td>
</tr>

<tr>
<td align="center" style="padding:36px 40px 28px;">
${logoBlock}
</td>
</tr>

<tr>
<td style="padding:0 40px;">
<div style="height:1px;background:#E5E7EB;"></div>
</td>
</tr>

<tr>
<td style="padding:36px 40px;">

<h2 style="margin:0 0 18px;font-family:Arial,sans-serif;font-size:26px;color:#111827;text-align:center;">
Password Reset
</h2>

<p style="margin:0 0 15px;font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#374151;text-align:center;">
We received a request to reset your password.
</p>

<p style="margin:0 0 30px;font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#374151;text-align:center;">
Use the following One-Time Password (OTP):
</p>

<table align="center" cellpadding="0" cellspacing="0">
<tr>
<td style="background:#EEF2FF;border:2px dashed #4F46E5;border-radius:12px;padding:18px 34px;">

<span style="font-size:34px;font-weight:700;letter-spacing:10px;font-family:monospace;color:#4F46E5;">
${otp}
</span>

</td>
</tr>
</table>

<p style="margin:30px 0 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#6B7280;text-align:center;">
This OTP will expire in <strong>${expiryMinutes} minutes</strong>.
</p>

<p style="margin:15px 0 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#DC2626;text-align:center;">
Never share this OTP with anyone.
</p>

<p style="margin:25px 0 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#6B7280;text-align:center;">
If you didn't request a password reset, you can safely ignore this email.
</p>

</td>
</tr>

<tr>
<td style="padding:30px 40px 36px;">

<div style="height:1px;background:#E5E7EB;margin-bottom:24px;"></div>

<p style="margin:0;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#9CA3AF;text-align:center;">
© ${year} Dudhkoshi Hydropower. All rights reserved.<br/>
This email was sent automatically by the system.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>`;
}

module.exports = {
  buildOtpEmailHtml,
};