import mongoose from "mongoose";

const URI = process.env.MONGO_URI;
if (!URI) {
  throw new Error("Database URI is missing!");
}

export const dbConnect = () => {
  mongoose
    .connect(URI)
    .then(() => {
      console.log("Connected to the database successfully!");
    })
    .catch(() => {
      console.log("Failed to connect to the database.");
    });
};
