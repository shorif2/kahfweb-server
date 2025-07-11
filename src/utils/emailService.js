const nodemailer = require("nodemailer");

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request - HostSeba",
      html: `
        <div style="background: #f4f6f8; padding: 40px 0; min-height: 100vh;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden; font-family: 'Segoe UI', Arial, sans-serif;">
            <tr>
              <td style="background: #f5f5f5; padding: 28px 0; text-align: center;">
                <img src="https://iili.io/3P4zDwG.png" alt="HostSeba Logo" style="height: 40px;" />
              </td>
            </tr>
            <tr>
              <td style="padding: 36px 40px 28px 40px;">
                <h2 style="color: #222; text-align: left; margin: 0 0 18px 0; font-size: 26px; font-weight: 700;">Password Reset Request</h2>
                <hr style="border: none; border-top: 1px solid #e6e6e6; margin: 18px 0 28px 0;" />
                <p style="font-size: 16px; margin: 0 0 18px 0; color: #333;">Hello,</p>
                <p style="font-size: 16px; margin: 0 0 18px 0; color: #333;">We received a request to reset your password for your <b>HostSeba</b> account.</p>
                <p style="font-size: 16px; margin: 0 0 28px 0; color: #333;">To proceed, please click the button below. This link will expire in <b>1 hour</b> for your security.</p>
                <div style="text-align: center; margin: 36px 0;">
                  <a href="${resetUrl}"
                     style="background: #007bff; color: #fff; padding: 16px 40px; border-radius: 6px; text-decoration: none; font-size: 18px; font-weight: 600; display: inline-block; box-shadow: 0 2px 6px rgba(0,123,255,0.10); transition: background 0.2s;">Reset Password</a>
                </div>
                <hr style="border: none; border-top: 1px solid #e6e6e6; margin: 32px 0 24px 0;" />
                <p style="font-size: 15px; color: #555; margin: 0 0 12px 0;">If the button above does not work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #007bff; font-size: 15px; margin: 0 0 24px 0;">${resetUrl}</p>
                <p style="font-size: 15px; color: #555; margin: 0 0 24px 0;">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                <div style="margin-top: 36px;">
                  <p style="font-size: 15px; color: #333; margin: 0 0 4px 0;">Best regards,</p>
                  <p style="font-size: 15px; color: #007bff; font-weight: 600; margin: 0;">The HostSeba Team</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="background: #f0f4f8; text-align: center; padding: 18px 32px; font-size: 13px; color: #888; border-top: 1px solid #e6e6e6;">
                &copy; ${new Date().getFullYear()} HostSeba. All rights reserved.<br/>
                <span style="font-size: 12px;">Need help? Contact <a href="mailto:support@hostseba.com" style="color: #007bff; text-decoration: none;">support@hostseba.com</a></span>
              </td>
            </tr>
          </table>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
};

// Send password change confirmation email
const sendPasswordChangeConfirmation = async (email, userName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Changed Successfully - HostSeba",
      html: `
        <div style="background: #f4f6f8; padding: 40px 0; min-height: 100vh;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden; font-family: 'Segoe UI', Arial, sans-serif;">
            <tr>
              <td style="background: #f5f5f5; padding: 28px 0; text-align: center;">
                <img src="https://iili.io/3P4zDwG.png" alt="HostSeba Logo" style="height: 40px;" />
              </td>
            </tr>
            <tr>
              <td style="padding: 36px 40px 28px 40px;">
                <h2 style="color: #222; text-align: left; margin: 0 0 18px 0; font-size: 26px; font-weight: 700;">Password Changed Successfully</h2>
                <hr style="border: none; border-top: 1px solid #e6e6e6; margin: 18px 0 28px 0;" />
                <p style="font-size: 16px; margin: 0 0 18px 0; color: #333;">Hello ${userName},</p>
                <p style="font-size: 16px; margin: 0 0 18px 0; color: #333;">This is a confirmation that your password for your <b>HostSeba</b> account has been changed successfully.</p>
                <p style="font-size: 16px; margin: 0 0 28px 0; color: #333;">If you did not make this change, please contact our support team immediately to secure your account.</p>
                <div style="margin-top: 36px;">
                  <p style="font-size: 15px; color: #333; margin: 0 0 4px 0;">Best regards,</p>
                  <p style="font-size: 15px; color: #007bff; font-weight: 600; margin: 0;">The HostSeba Team</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="background: #f0f4f8; text-align: center; padding: 18px 32px; font-size: 13px; color: #888; border-top: 1px solid #e6e6e6;">
                &copy; ${new Date().getFullYear()} HostSeba. All rights reserved.<br/>
                <span style="font-size: 12px;">Need help? Contact <a href="mailto:support@hostseba.com" style="color: #007bff; text-decoration: none;">support@hostseba.com</a></span>
              </td>
            </tr>
          </table>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return true;
  } catch (error) {
    console.error("Error sending password change confirmation email:", error);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendPasswordChangeConfirmation,
};
