import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { RequestHandler } from "express";
import { BookModel, UserModel } from "@/models";
import { IsPurchasedByTheUserRequestHandler } from "@/types";
import { formatUserProfile, sendErrorResponse } from "@/utils/helper";

declare global {
  namespace Express {
    export interface Request {
      user: {
        id: string;
        name?: string;
        email: string;
        role: "user" | "author";
        avatar?: string;
        signedUp: boolean;
        authorId?: string;
      };
    }
  }
}

export const isAuth: RequestHandler = asyncHandler(async (req, res, next) => {
  const authToken = req.cookies.authToken;
  if (!authToken) {
    return sendErrorResponse({
      status: 401,
      message: "Unauthorized request!",
      res,
    });
  }
  const payload = jwt.verify(authToken, process.env.JWT_SECRET!) as {
    userId: string;
  };
  const user = await UserModel.findById(payload.userId);
  if (!user) {
    return sendErrorResponse({
      status: 401,
      message: "Unauthorized request, user not found!",
      res,
    });
  }

  req.user = formatUserProfile(user);
  next();
});

export const isPurchasedByTheUser: IsPurchasedByTheUserRequestHandler =
  asyncHandler(async (req, res, next) => {
    const user = await UserModel.findOne({
      _id: req.user.id,
      books: req.body.bookId,
    });
    if (!user) {
      return sendErrorResponse({
        status: 403,
        message: "Sorry we didn't found the book inside your library!",
        res,
      });
    }
    next();
  });

export const isAuthor: RequestHandler = asyncHandler((req, res, next) => {
  if (req.user.role === "author") {
    next();
  } else {
    return sendErrorResponse({ status: 401, message: "Invalid request!", res });
  }
});
export const isValidReadingRequest: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const url = req.url;
    const regex = new RegExp("/([^/?]+.epub)");
    const regexMatch = url.match(regex);

    if (!regexMatch) {
      return sendErrorResponse({
        status: 403,
        message: "Invalid request!",
        res,
      });
    }
    const bookFileId = regexMatch[1];
    const book = await BookModel.findOne({ "fileInfo.id": bookFileId });
    if (!book) {
      return sendErrorResponse({
        status: 404,
        message: "Book not found!",
        res,
      });
    }
    const user = await UserModel.findOne({ _id: req.user.id, books: book._id });
    if (!user) {
      return sendErrorResponse({
        status: 403,
        message: "Unauthorized request!",
        res,
      });
    }
    next();
  }
);
