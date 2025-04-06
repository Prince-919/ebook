import { config } from "@/config";
import nodemailer from "nodemailer";

interface VerificationMailOptions {
  link: string;
  to: string;
}

const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: config.get("mailtrapUser"),
    pass: config.get("mailtrapPass"),
  },
});

const mail = {
  sendVerificationMail(options: VerificationMailOptions) {
    transport.sendMail({
      to: options.to,
      from: config.get("verificationMail"),
      subject: "Auth Verification",
      html: `
      <div>
      <p>Please click on <a href="${options.link}">this link</a> to verify you account.</p>
      </div>
      `,
    });
  },
};
export default mail;
