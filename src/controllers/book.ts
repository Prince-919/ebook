import { AuthorModel, BookModel } from "@/models";
import { BookDoc } from "@/models/book";
import { CreateBookRequestHandler } from "@/types";
import {
  uploadBookToLocalDir,
  uploadCoverToCloudinary,
} from "@/utils/fileUpload";
import { formatFileSize, sendErrorResponse } from "@/utils/helper";
import asyncHandler from "express-async-handler";
import { Types } from "mongoose";
import slugify from "slugify";

export const createNewBook: CreateBookRequestHandler = asyncHandler(
  async (req, res) => {
    const { body, files, user } = req;
    const {
      title,
      description,
      genre,
      language,
      fileInfo,
      price,
      publicationName,
      publishedAt,
    } = body;
    const { cover, book } = files;

    const newBook = new BookModel<BookDoc>({
      title,
      description,
      genre,
      language,
      fileInfo: { size: formatFileSize(fileInfo.size), id: "" },
      price,
      publicationName,
      publishedAt,
      slug: "",
      author: new Types.ObjectId(user.authorId),
    });

    newBook.slug = slugify(`${newBook.title} ${newBook._id}`, {
      lower: true,
      replacement: "-",
    });

    if (cover && !Array.isArray(cover)) {
      await uploadCoverToCloudinary(cover);
    }
    if (
      !book ||
      Array.isArray(book) ||
      book.mimetype !== "application/epub+zip"
    ) {
      return sendErrorResponse({
        status: 422,
        message: "Invalid book file!",
        res,
      });
    }
    const uniqueFileName = slugify(`${newBook._id} ${newBook.title}.epub`, {
      lower: true,
      replacement: "-",
    });
    uploadBookToLocalDir(book, uniqueFileName);

    if (newBook.fileInfo) {
      newBook.fileInfo.id = uniqueFileName;
    }

    await AuthorModel.findByIdAndUpdate(user.authorId, {
      $push: { books: newBook._id },
    });
    await newBook.save();
    res.send();
  }
);
