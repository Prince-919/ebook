import "./db/connect";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error";
import formidable from "formidable";
import { authorRouter, authRouter, bookRouter, reviewRouter } from "./routes";
import { ReviewModel } from "./models";
import { Types } from "mongoose";

const app = express();
const port = process.env.PORT || 5000;

const publicPath = path.join(__dirname, "./books");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/books", express.static(publicPath));

app.use("/auth", authRouter);
app.use("/author", authorRouter);
app.use("/book", bookRouter);
app.use("/review", reviewRouter);

app.get("/test", async (req, res) => {
  const [result] = await ReviewModel.aggregate<{ averageRating: number }>([
    {
      $match: {
        book: new Types.ObjectId("688ee31b7bcb9a70e7787801"),
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
      },
    },
  ]);
  res.json({ review: result?.averageRating.toFixed(1) });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`The application is running on port http://localhost:${port} `);
});
