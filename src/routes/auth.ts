import { Router } from "express";

const authRouter = Router();

authRouter.post("/generate-link");
authRouter.post("/verify");
authRouter.post("/profile");

export default authRouter;
