import { Router } from "express";
import { isAuth, isPurchasedByTheUser } from "@/middlewares/auth";
import { getBookHistory, updateBookHistory } from "@/controllers/history";
import { historyValidationSchema, validate } from "@/middlewares/validator";

const historyRouter = Router();

historyRouter.post(
  "/",
  isAuth,
  validate(historyValidationSchema),
  isPurchasedByTheUser,
  updateBookHistory
);

historyRouter.get("/:bookId", isAuth, getBookHistory);

export default historyRouter;
