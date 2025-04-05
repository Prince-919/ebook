import { Router } from "express";
import { AuthCtrl } from "@/controllers";

const authRouter = Router();

authRouter.post(
  "/generate-link",
  (req, res, next) => {
    const { email } = req.body;
    const regex = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$");
    if (!regex.test(email)) {
      res.status(422).json({ error: "Invalid email!" });
      return;
    }
    next();
  },
  AuthCtrl.generateAuthLink
);

export default authRouter;
