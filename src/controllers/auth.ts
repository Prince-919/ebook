import { RequestHandler } from "express";
import { randomBytes } from "crypto";
import { UserModel, VerificationTokenModel } from "@/models";
import mail from "@/utils/mail";
import asyncHandler from "express-async-handler";
import { formatUserProfile, sendErrorResponse } from "@/utils/helper";
import jwt from "jsonwebtoken";
import { cloudinary } from "@/cloud";
import { uploadAvatarToCloudinary } from "@/utils/fileUpload";

export const generateAuthLink: RequestHandler = asyncHandler(
  async (req, res) => {
    // Step 1: Generate Unique token for every users
    // Step 2: Store that token securely inside the database so that we can validate it in feture.
    // Step 3: Create a link which include that secure token and user information
    // Step 4: Send that link to users email address.
    // Step 5: Notify user to look inside the email to get the login link.

    const { email } = req.body;
    let user = await UserModel.findOne({ email });
    if (!user) {
      user = await UserModel.create({ email });
    }
    const userId = user._id.toString();
    // if we already have token for this user it will be remove that first
    await VerificationTokenModel.findOneAndDelete({ userId });

    const randomToken = randomBytes(36).toString("hex");
    await VerificationTokenModel.create<{ userId: string }>({
      userId,
      token: randomToken,
    });

    const link = `${process.env.VERIFICATION_LINK}?token=${randomToken}&userId=${userId}`;
    await mail.sendverificationMail({ link, to: user.email });

    res.json({ message: "Please check your email for link." });
  }
);

export const verifyAuthToken: RequestHandler = asyncHandler(
  async (req, res) => {
    const { token, userId } = req.query;
    if (typeof token !== "string" || typeof userId !== "string") {
      return sendErrorResponse({
        status: 403,
        message: "Invalid request!",
        res,
      });
    }
    const verificationToken = await VerificationTokenModel.findOne({ userId });
    if (!verificationToken || !verificationToken.compare(token)) {
      return sendErrorResponse({
        status: 403,
        message: "Invalid request, token mismatch!",
        res,
      });
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return sendErrorResponse({
        status: 500,
        message: "Something went wrong!",
        res,
      });
    }
    await VerificationTokenModel.findByIdAndDelete(verificationToken._id);

    // TODO: authentication
    const payload = { userId: user._id };
    const authToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "15d",
    });

    res.cookie("authToken", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    });
    res.redirect(
      `${process.env.AUTH_SUCCESS_URL}?profile=${JSON.stringify(
        formatUserProfile(user)
      )}`
    );
  }
);

export const sendProfileInfo: RequestHandler = asyncHandler(
  async (req, res) => {
    res.json({
      profile: req.user,
    });
  }
);
export const updateProfile: RequestHandler = asyncHandler(async (req, res) => {
  console.log("req.files:", req.files);
  const user = await UserModel.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      signedUp: true,
    },
    { new: true }
  );
  if (!user) {
    return sendErrorResponse({
      status: 404,
      message: "Something went wrong, user not found!",
      res,
    });
  }
  const file = req.files?.avatar;
  if (file && !Array.isArray(file)) {
    user.avatar = await uploadAvatarToCloudinary(file, user.avatar?.id);
    await user.save();
  }
  res.json({ profile: formatUserProfile(user) });
});
export const logout: RequestHandler = asyncHandler(async (req, res) => {
  res.clearCookie("authToken").send();
});
