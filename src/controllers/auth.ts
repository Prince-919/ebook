import { RequestHandler } from "express";

class AuthCtrl {
  static generateAuthLink: RequestHandler = async (req, res) => {
    res.json({ ok: true });
  };
}

export default AuthCtrl;
