import asyncHandler from "express-async-handler";
import { AddReviewRequestHandler } from "@/types";
import { BookModel, ReviewModel } from "@/models";
import { RequestHandler } from "express";
import { sendErrorResponse } from "@/utils/helper";
import { isValidObjectId, Types } from "mongoose";

export const addReview: AddReviewRequestHandler = asyncHandler(
  async (req, res) => {
    const { bookId, rating, content } = req.body;

    await ReviewModel.findOneAndUpdate(
      { book: bookId, user: req.user.id },
      { rating, content },
      { upsert: true }
    );
    const [result] = await ReviewModel.aggregate<{ averageRating: number }>([
      {
        $match: {
          book: new Types.ObjectId(bookId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    await BookModel.findByIdAndUpdate(bookId, {
      averageRating: result.averageRating,
    });
    res.json({ message: "Review updated." });
  }
);
export const getReview: RequestHandler = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  if (!isValidObjectId(bookId)) {
    return sendErrorResponse({
      status: 404,
      message: "Book id is not valid!",
      res,
    });
  }
  const review = await ReviewModel.findOne({ book: bookId, user: req.user.id });
  if (!review) {
    return sendErrorResponse({
      status: 404,
      message: "Review not found!",
      res,
    });
  }
  res.json({ content: review.content, rating: review.rating });
});
