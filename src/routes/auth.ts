import { Router } from "express";
import {
  generateAuthLink,
  logout,
  sendProfileInfo,
  verifyAuthToken,
} from "@/controllers/auth";
import { emailValidationSchema, validate } from "@/middlewares/validator";
import { isAuth } from "@/middlewares/auth";

const authRouter = Router();

authRouter.post(
  "/generate-link",
  validate(emailValidationSchema),
  generateAuthLink
);
authRouter.get("/verify", verifyAuthToken);
authRouter.get("/profile", isAuth, sendProfileInfo);
authRouter.post("/logout", isAuth, logout);

export default authRouter;
