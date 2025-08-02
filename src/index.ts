import "./db/connect";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error";
import { authorRouter, authRouter, bookRouter } from "./routes";
import formidable from "formidable";

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

app.post("/test", async (req, res) => {
  const form = formidable({
    uploadDir: path.join(__dirname, "./books"),
    filename(name, ext, part, form) {
      return name + ".jpg";
    },
  });
  await form.parse(req);
  res.json({});
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`The application is running on port http://localhost:${port} `);
});
