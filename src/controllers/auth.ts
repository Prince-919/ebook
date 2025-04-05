import { RequestHandler } from "express";

class AuthCtrl {
  static generateAuthLink: RequestHandler = async (req, res) => {
    console.log(req.body);
    res.json({ ok: true });
  };
}

export default AuthCtrl;
