import { Router } from "express";
import { fileParser } from "@/middlewares/file";
import { isAuth, isAuthor } from "@/middlewares/auth";
import {
  newBookSchema,
  updateBookSchema,
  validate,
} from "@/middlewares/validator";
import {
  createNewBook,
  generateBookAccessUrl,
  getAllPurchasedBooks,
  getBookByGenre,
  getBooksPublicDetails,
  updateBook,
} from "@/controllers/book";

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
bookRouter.get("/list", isAuth, getAllPurchasedBooks);
bookRouter.get("/details/:slug", getBooksPublicDetails);
bookRouter.get("/by-genre/:genre", getBookByGenre);
bookRouter.get("/read/:slug", isAuth, generateBookAccessUrl);

export default bookRouter;
