import { Model, model, ObjectId, Schema } from "mongoose";

export interface AuthorDoc {
  userId: ObjectId;
  name: string;
  about: string;
  slug: string;
  socialLinks: string[];
  books: ObjectId[];
}

const authorSchema = new Schema<AuthorDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    about: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    socialLinks: [String],
    books: [
      {
        type: Schema.Types.ObjectId,
        ref: "Book",
      },
    ],
  },
  { timestamps: true }
);

const AuthorModel = model("Author", authorSchema);
export default AuthorModel as Model<AuthorDoc>;
