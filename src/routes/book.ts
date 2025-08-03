import { Router } from "express";
import { fileParser } from "@/middlewares/file";
import { isAuth, isAuthor } from "@/middlewares/auth";
import {
  newBookSchema,
  updateBookSchema,
  validate,
} from "@/middlewares/validator";
import { createNewBook, updateBook } from "@/controllers/book";

const bookRouter = Router();

bookRouter.post(
  "/create",
  isAuth,
  isAuthor,
  fileParser,
  validate(newBookSchema),
  createNewBook
);
bookRouter.patch(
  "/",
  isAuth,
  isAuthor,
  fileParser,
  validate(updateBookSchema),
  updateBook
);

export default bookRouter;
