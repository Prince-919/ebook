import { Router } from "express";
import {
  generateAuthLink,
  logout,
  sendProfileInfo,
  updateProfile,
  verifyAuthToken,
} from "@/controllers/auth";
import {
  emailValidationSchema,
  newUserSchema,
  validate,
} from "@/middlewares/validator";
import { isAuth } from "@/middlewares/auth";
import { fileParser } from "@/middlewares/file";

const authRouter = Router();

authRouter.post(
  "/generate-link",
  validate(emailValidationSchema),
  generateAuthLink
);
authRouter.get("/verify", verifyAuthToken);
authRouter.get("/profile", isAuth, sendProfileInfo);
authRouter.put(
  "/profile",
  isAuth,
  fileParser,
  validate(newUserSchema),
  updateProfile
);
authRouter.post("/logout", isAuth, logout);

export default authRouter;
