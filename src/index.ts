import "./db/connect";
import express from "express";
import { authRouter } from "./routes";
import { errorHandler } from "./middlewares/error";
import cookieParser from "cookie-parser";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/auth", authRouter);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`The application is running on port http://localhost:${port} `);
});
