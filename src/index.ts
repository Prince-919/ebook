import express from "express";
import { config } from "./config";
import routes from "./routes";
const app = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  req.on("data", (chunk) => {
    req.body = JSON.parse(chunk);
    next();
  });
}, routes);

app.get("/test", (req, res, next) => {
  console.log(req.body);
  next();
});

const startServer = async () => {
  try {
    const port = config.get("port");
    app.listen(port, () => {
      console.log(`Server is running on port http://localhost:${port}.`);
    });
  } catch (error) {
    console.log(`Server failed to start. Please check the following.`);
  }
};

startServer();
