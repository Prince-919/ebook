import { RequestHandler } from "express";
import crypto from "crypto";
import { UserModel, VerificationTokenModel } from "@/models";

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
    res.json({ ok: true });
  };
}

export default AuthCtrl;
