import "./db/connect";
import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error";
import {
  authorRouter,
  authRouter,
  bookRouter,
  historyRouter,
  reviewRouter,
} from "./routes";
import { isAuth, isValidReadingRequest } from "./middlewares/auth";

const app = express();
const port = process.env.PORT || 5000;

const publicPath = path.join(__dirname, "./books");

app.use(cors({ origin: [process.env.FRONTEND_URL!], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/books", isAuth, isValidReadingRequest, express.static(publicPath));

app.use("/auth", authRouter);
app.use("/author", authorRouter);
app.use("/book", bookRouter);
app.use("/review", reviewRouter);
app.use("/history", historyRouter);

app.get("/test", async (req, res) => {
  res.json({});
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`The application is running on port http://localhost:${port} `);
});
