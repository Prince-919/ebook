import { Router } from "express";
import { AuthCtrl } from "@/controllers";

const authRouter = Router();

authRouter.post("/generate-link", AuthCtrl.generateAuthLink);
authRouter.post("/verify");
authRouter.post("/profile");

export default authRouter;
