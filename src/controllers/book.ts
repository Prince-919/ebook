import { AuthorModel, BookModel } from "@/models";
import { BookDoc } from "@/models/book";
import { CreateBookRequestHandler, UpdateBookRequestHandler } from "@/types";
import {
  uploadBookToLocalDir,
  uploadCoverToCloudinary,
} from "@/utils/fileUpload";
import { formatFileSize, sendErrorResponse } from "@/utils/helper";
import asyncHandler from "express-async-handler";
import { Types } from "mongoose";
import path from "path";
import fs from "fs";
import slugify from "slugify";
import { cloudinary } from "@/cloud";

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
      uploadMethod,
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

    const uniqueFileName = slugify(`${newBook._id} ${newBook.title}.epub`, {
      lower: true,
      replacement: "-",
    });
    if (uploadMethod === "local") {
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
      if (
        cover &&
        !Array.isArray(cover) &&
        cover.mimetype?.startsWith("image")
      ) {
        newBook.cover = await uploadCoverToCloudinary(cover);
      }
      uploadBookToLocalDir(book, uniqueFileName);
    }

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

export const updateBook: UpdateBookRequestHandler = asyncHandler(
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
      slug,
      uploadMethod,
    } = body;
    const { cover, book: newBookFile } = files;

    const book = await BookModel.findOne({ slug, author: user.authorId });
    if (!book) {
      return sendErrorResponse({
        status: 404,
        message: "Book not found!",
        res,
      });
    }

    book.title = title;
    book.description = description;
    book.genre = genre;
    book.language = language;
    book.price = price;
    book.publicationName = publicationName;
    book.publishedAt = publishedAt;

    if (uploadMethod === "local") {
      if (
        newBookFile &&
        !Array.isArray(newBookFile) &&
        newBookFile.mimetype !== "application/epub+zip"
      ) {
        if (!book.fileInfo?.id) {
          return sendErrorResponse({
            status: 400,
            message: "Invalid file info for the book!",
            res,
          });
        }
        const uploadPath = path.join(__dirname, "../books");
        const oldFilePath = path.join(uploadPath, book.fileInfo?.id);

        if (!fs.existsSync(oldFilePath))
          return sendErrorResponse({
            status: 404,
            message: "Book file not found!",
            res,
          });
        fs.unlinkSync(oldFilePath);

        const newFileName = slugify(`${book._id} ${book.title}.epub`, {
          lower: true,
          replacement: "-",
        });
        const newFilePath = path.join(uploadPath, newFileName);
        const file = fs.readFileSync(newBookFile.filepath);
        fs.writeFileSync(newFilePath, file);

        book.fileInfo = {
          id: newFileName,
          size: formatFileSize(fileInfo?.size || newBookFile.size),
        };
      }
      if (
        cover &&
        !Array.isArray(cover) &&
        cover.mimetype?.startsWith("image")
      ) {
        if (book.cover?.id) {
          await cloudinary.uploader.destroy(book.cover.id);
        }
        book.cover = await uploadCoverToCloudinary(cover);
      }
    }
    await book.save();
    res.send();
  }
);
