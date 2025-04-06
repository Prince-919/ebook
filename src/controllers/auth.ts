import { RequestHandler } from "express";
import crypto from "crypto";
import { UserModel, VerificationTokenModel } from "@/models";
import mail from "@/utils/mail";
import { config } from "@/config";

class AuthCtrl {
  static generateAuthLink: RequestHandler = async (req, res) => {
    const { email } = req.body;
    let user = await UserModel.findOne({ email });
    if (!user) {
      user = await UserModel.create({ email });
    }

    const userId = user._id.toString();
    await VerificationTokenModel.findOneAndDelete({ userId });

    const randomToken = crypto.randomBytes(36).toString("hex");

    await VerificationTokenModel.create<{ userId: string }>({
      userId,
      token: randomToken,
    });

    const link = `${config.get(
      "verificationLink"
    )}?token=${randomToken}&userId=${userId}`;

    mail.sendVerificationMail({
      link,
      to: user.email,
    });
    res.json({ message: "Plesae check you email for link." });
  };
}

export default AuthCtrl;
