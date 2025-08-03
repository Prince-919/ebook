import { Router } from "express";
import { addReview, getReview } from "@/controllers/review";
import { isAuth, isPurchasedByTheUser } from "@/middlewares/auth";
import { newReviewSchema, validate } from "@/middlewares/validator";

const reviewRouter = Router();

reviewRouter.post(
  "/",
  isAuth,
  validate(newReviewSchema),
  isPurchasedByTheUser,
  addReview
);
reviewRouter.get("/:bookId", isAuth, getReview);

export default reviewRouter;
