import { UserModel } from "@/models";
import { formatUserProfile, sendErrorResponse } from "@/utils/helper";
import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongoose";

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

export const isAuthor: RequestHandler = asyncHandler((req, res, next) => {
  if (req.user.role === "author") {
    next();
  } else {
    return sendErrorResponse({ status: 401, message: "Invalid request!", res });
  }
});
