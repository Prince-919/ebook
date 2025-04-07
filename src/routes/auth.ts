import { Router } from "express";
import { AuthCtrl } from "@/controllers";
import { emailValidationSchema, validate } from "@/middlewares/validator";

const authRouter = Router();

authRouter.post(
  "/generate-link",
  validate(emailValidationSchema),
  AuthCtrl.generateAuthLink
);
authRouter.get("/verify", AuthCtrl.verifyAuthToken);

export default authRouter;
