import { RequestHandler } from "express";
import crypto from "crypto";
import { UserModel, VerificationToken } from "@/models";

class AuthCtrl {
  static generateAuthLink: RequestHandler = async (req, res) => {
    const { email } = req.body;
    let user = await UserModel.findOne({ email });
    if (!user) {
      user = await UserModel.create({ email });
    }
    const randomToken = crypto.randomBytes(36).toString("hex");
    console.log(randomToken);

    await VerificationToken.create<{ userId: string }>({
      userId: user._id.toString(),
      token: randomToken,
    });
    res.json({ ok: true });
  };
}

export default AuthCtrl;
