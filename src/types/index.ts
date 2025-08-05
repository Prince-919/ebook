import { z } from "zod";
import { RequestHandler } from "express";
import {
  historyValidationSchema,
  newAuthorSchema,
  newBookSchema,
  newReviewSchema,
  updateBookSchema,
} from "@/middlewares/validator";

type AuthorHandlerBody = z.infer<typeof newAuthorSchema>;
type NewBookBody = z.infer<typeof newBookSchema>;
type UpdateBookBody = z.infer<typeof updateBookSchema>;
type AddReviewBody = z.infer<typeof newReviewSchema>;
type BookHistoryBody = z.infer<typeof historyValidationSchema>;
type IsPurchasedByTheUserBody = { bookId: string };

export type RequestAuthorHandler = RequestHandler<{}, {}, AuthorHandlerBody>;
export type CreateBookRequestHandler = RequestHandler<{}, {}, NewBookBody>;
export type UpdateBookRequestHandler = RequestHandler<{}, {}, UpdateBookBody>;
export type AddReviewRequestHandler = RequestHandler<{}, {}, AddReviewBody>;
export type UpdateHistoryRequestHandler = RequestHandler<
  {},
  {},
  BookHistoryBody
>;
export type IsPurchasedByTheUserRequestHandler = RequestHandler<
  {},
  {},
  IsPurchasedByTheUserBody
>;
