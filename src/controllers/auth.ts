import { RequestHandler } from "express";
import crypto from "crypto";

class AuthCtrl {
  static generateAuthLink: RequestHandler = async (req, res) => {
    const { email } = req.body;
    const token = crypto.randomBytes(36).toString();
    res.json({ ok: true });
  };
}

export default AuthCtrl;
