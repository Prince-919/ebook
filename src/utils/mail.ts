import nodemailer from "nodemailer";

interface VerificationMailOptions {
  to: string;
  link: string;
}

var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

const mail = {
  async sendverificationMail(options: VerificationMailOptions) {
    await transport.sendMail({
      to: options.to,
      from: process.env.VERIFICATION_MAIL,
      subject: "Auth Verification",
      html: `<div style="background-color: #f4f4f4; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      
      <div style="text-align: center;">
        <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" width="64" height="64" alt="verify icon" />
        <h2 style="color: #333;">Verify Your Email</h2>
      </div>
      
      <p style="color: #555; font-size: 16px;">
        Hello <strong>${options.to}</strong>,
      </p>
      
      <p style="color: #555; font-size: 15px;">
        Thank you for signing up! Please click the button below to verify your email address and activate your account.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${options.link}" style="background-color: #4a90e2; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
          Verify Email
        </a>
      </div>

      <p style="color: #777; font-size: 13px; text-align: center;">
        If the button doesn't work, copy and paste this URL into your browser:
      </p>
      <p style="word-break: break-all; font-size: 13px; text-align: center; color: #4a90e2;">
        <a href="${options.link}" style="color: #4a90e2;">${options.link}</a>
      </p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />

      <p style="font-size: 12px; color: #aaa; text-align: center;">
        If you did not sign up for this account, you can ignore this email.
      </p>
    </div>
  </div>`,
    });
  },
};
export default mail;
