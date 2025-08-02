import { Router } from "express";
import { isAuth } from "@/middlewares/auth";
import { newAuthorSchema, validate } from "@/middlewares/validator";
import { getAuthorDetails, registerAuthor } from "@/controllers/author";

const authorRouter = Router();

authorRouter.post(
  "/register",
  isAuth,
  validate(newAuthorSchema),
  registerAuthor
);
authorRouter.get("/:slug", getAuthorDetails);

export default authorRouter;
