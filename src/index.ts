import express from "express";
import { config } from "./config";
const app = express();

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "Welcome to the Ebook Store API! Explore our collection of ebooks and start your reading journey today.",
  });
});

const startServer = async () => {
  const port = config.get("port");
  app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
  });
};

startServer();
