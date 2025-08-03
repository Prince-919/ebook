import { cloudinary } from "@/cloud";
import { File } from "formidable";
import fs from "fs";
import path from "path";

export const updateAvatarToCloudinary = async (
  file: File,
  avatarId?: string
) => {
  if (avatarId) {
    await cloudinary.uploader.destroy(avatarId);
  }
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    file.filepath,
    {
      width: 300,
      height: 300,
      gravity: "face",
      crop: "fill",
      folder: "ebookStore/profile",
    }
  );
  return { id: public_id, url: secure_url };
};

export const uploadCoverToCloudinary = async (file: File) => {
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    file.filepath,
    {
      folder: "ebookStore/covers",
    }
  );
  return { id: public_id, url: secure_url };
};

export const uploadBookToLocalDir = async (
  file: File,
  uniqueFileName: string
) => {
  const bookStoragePath = path.join(__dirname, "../books");
  if (!fs.existsSync(bookStoragePath)) {
    fs.mkdirSync(bookStoragePath);
  }

  const filePath = path.join(bookStoragePath, uniqueFileName);
  fs.writeFileSync(filePath, fs.readFileSync(file.filepath));
  // return {
  //   id: uniqueFileName,
  //   url: `${process.env.BOOK_API_URL}/${uniqueFileName}`,
  // };
};
