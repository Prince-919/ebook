import { AuthorModel, UserModel } from "@/models";
import { RequestAuthorHandler } from "@/types";
import { sendErrorResponse } from "@/utils/helper";
import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import slugify from "slugify";

export const registerAuthor: RequestAuthorHandler = asyncHandler(
  async (req, res) => {
    const { body, user } = req;
    if (!user.signedUp) {
      sendErrorResponse({
        status: 401,
        message: "You must signed up before registering as an author!",
        res,
      });
    }
    const newAuthor = new AuthorModel({
      userId: user.id,
      name: body.name,
      about: body.about,
      socialLinks: body.socialLinks,
    });

    const uniqueSlug = slugify(`${newAuthor.name} ${newAuthor._id}`, {
      lower: true,
      replacement: "-",
    });

    newAuthor.slug = uniqueSlug;
    await newAuthor.save();

    await UserModel.findByIdAndUpdate(user.id, {
      role: "author",
      authorId: newAuthor._id,
    });
    res.json({ message: "Thanks for registering as an author." });
  }
);
export const updateAuthor: RequestAuthorHandler = asyncHandler(
  async (req, res) => {
    const { body, user } = req;

    await AuthorModel.findByIdAndUpdate(user.authorId, {
      name: body.name,
      about: body.about,
      socialLinks: body.socialLinks,
    });

    res.json({ message: "Your details updated successfully." });
  }
);

export const getAuthorDetails: RequestHandler = asyncHandler(
  async (req, res) => {
    const { slug } = req.params;
    const author = await AuthorModel.findOne({ slug });
    if (!author) {
      return sendErrorResponse({
        status: 404,
        message: "Author not found!",
        res,
      });
    }
    res.json({
      id: author._id,
      name: author.name,
      about: author.about,
      socialLinks: author.socialLinks,
    });
  }
);
