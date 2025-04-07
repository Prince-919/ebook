import { RequestHandler } from "express";
import crypto from "crypto";
import { UserModel, VerificationTokenModel } from "@/models";
import mail from "@/utils/mail";
import { config } from "@/config";
import { sendErrorResponse } from "@/utils/helper";

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

  static verifyAuthToken: RequestHandler = async (req, res) => {
    const { token, userId } = req.query;
    if (typeof token !== "string" || typeof userId !== "string") {
      return sendErrorResponse({
        status: 403,
        message: "Invalid request!",
        res,
      });
    }

    const verificationToken = await VerificationTokenModel.findOne({ userId });
    if (!verificationToken || !verificationToken.compare(token)) {
      return sendErrorResponse({
        status: 403,
        message: "Invalid request token mismatch!",
        res,
      });
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return sendErrorResponse({
        status: 500,
        message: "Something went wrong, user not found!",
        res,
      });
    }

    await VerificationTokenModel.findByIdAndDelete(verificationToken._id);
    res.json({});
  };
}

export default AuthCtrl;
