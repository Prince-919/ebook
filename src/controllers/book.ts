import { AuthorModel, BookModel, HistoryModel, UserModel } from "@/models";
import { BookDoc } from "@/models/book";
import { CreateBookRequestHandler, UpdateBookRequestHandler } from "@/types";
import {
  uploadBookToLocalDir,
  uploadCoverToCloudinary,
} from "@/utils/fileUpload";
import { formatFileSize, sendErrorResponse } from "@/utils/helper";
import asyncHandler from "express-async-handler";
import { ObjectId, Types } from "mongoose";
import path from "path";
import fs from "fs";
import slugify from "slugify";
import { cloudinary } from "@/cloud";
import { RequestHandler } from "express";
import { Settings } from "@/models/history";

interface PopulatedBooks {
  cover: {
    url: string;
    id: string;
  };
  _id: ObjectId;
  author: {
    _id: ObjectId;
    name: string;
    slug: string;
  };
  title: string;
  slug: string;
}

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

export const getAllPurchasedBooks: RequestHandler = asyncHandler(
  async (req, res) => {
    const user = await UserModel.findById(req.user.id).populate<{
      books: PopulatedBooks[];
    }>({
      path: "books",
      select: "author title cover slug",
      populate: { path: "author", select: "slug name" },
    });
    if (!user) {
      res.json({ books: [] });
      return;
    }
    res.json({
      books: user?.books.map((book) => ({
        id: book._id,
        title: book.title,
        cover: book.cover.url,
        slug: book.slug,
        author: {
          name: book.author.name,
          slug: book.author.slug,
        },
      })),
    });
  }
);

export const getBooksPublicDetails: RequestHandler = asyncHandler(
  async (req, res) => {
    const book = await BookModel.findOne({
      slug: req.params.slug,
    }).populate<{ author: PopulatedBooks["author"] }>({
      path: "author",
      select: "name slug",
    });

    if (!book) {
      return sendErrorResponse({
        status: 404,
        message: "Book not found!",
        res,
      });
    }

    const {
      _id,
      title,
      cover,
      author,
      slug,
      description,
      genre,
      language,
      publishedAt,
      publicationName,
      averageRating,
      price: { mrp, sale },
      fileInfo,
    } = book;

    res.json({
      id: _id,
      title,
      genre,
      language,
      slug,
      description,
      publicationName,
      fileInfo,
      publishedAt: publishedAt.toISOString().split("T")[0],
      cover: cover?.url,
      rating: averageRating?.toFixed(1),
      price: {
        mrp: (mrp / 100).toFixed(2),
        sale: (sale / 100).toFixed(2),
      },
      author: {
        id: author._id,
        name: author.name,
        slug: author.slug,
      },
    });
  }
);

export const getBookByGenre: RequestHandler = asyncHandler(async (req, res) => {
  const books = await BookModel.find({ genre: req.params.genre }).limit(5);

  res.json({
    books: books.map((book) => {
      const {
        _id,
        title,
        cover,
        averageRating,
        genre,
        slug,
        price: { mrp, sale },
      } = book;
      return {
        id: _id,
        title,
        genre,
        slug,
        cover: cover?.url,
        rating: averageRating?.toFixed(1),
        price: {
          mrp: (mrp / 100).toFixed(2),
          sale: (sale / 100).toFixed(2),
        },
      };
    }),
  });
});

export const generateBookAccessUrl: RequestHandler = asyncHandler(
  async (req, res) => {
    const { slug } = req.params;
    const book = await BookModel.findOne({ slug });
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
        status: 404,
        message: "User not found!",
        res,
      });
    }
    const history = await HistoryModel.findOne({
      reader: req.user.id,
      book: book._id,
    });
    const settings: Settings = {
      lastLocation: "",
      highlights: [],
    };

    if (history) {
      settings.highlights = history.highlights.map((h) => ({
        fill: h.fill,
        selection: h.selection,
      }));
      settings.lastLocation = history.lastLocation;
    }
    res.json({
      settings,
      url: `${process.env.BOOK_API_URL}/${book.fileInfo?.id}`,
    });
  }
);
