import { z } from "zod";
import { RequestHandler } from "express";
import {
  newAuthorSchema,
  newBookSchema,
  updateBookSchema,
} from "@/middlewares/validator";

type AuthorHandlerBody = z.infer<typeof newAuthorSchema>;
type NewBookBody = z.infer<typeof newBookSchema>;
type UpdateBookBody = z.infer<typeof updateBookSchema>;
export type RequestAuthorHandler = RequestHandler<{}, {}, AuthorHandlerBody>;
export type CreateBookRequestHandler = RequestHandler<{}, {}, NewBookBody>;
export type UpdateBookRequestHandler = RequestHandler<{}, {}, UpdateBookBody>;
