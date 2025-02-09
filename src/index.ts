import express from "express";
import { config } from "./config";
const app = express();

const startServer = async () => {
  const port = config.get("port");
  app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
  });
};

startServer();
