import { RequestHandler } from "express";

class AuthCtrl {
  static generateAuthLink: RequestHandler = async (req, res) => {
    res.send("<h1>Namaste NodeJs</h1>");
  };
}

export default AuthCtrl;
