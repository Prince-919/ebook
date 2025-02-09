import express from "express";
const app = express();

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "Welcome to the Ebook Store API! Explore our collection of ebooks and start your reading journey today.",
  });
});

app.listen(8000, () => {
  console.log(`Server is running on port http://localhost:${8000}`);
});
