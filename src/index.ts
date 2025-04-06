import "express-async-errors";
import express from "express";
import { config, dbConnect } from "./config";
import routes from "./routes";
import { errorHandler } from "./middlewares/error";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(routes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await dbConnect();
    const port = config.get("port");
    app.listen(port, () => {
      console.log(`Server is running on port http://localhost:${port}.`);
    });
  } catch (error) {
    console.log(`Server failed to start. Please check the following.`);
  }
};

startServer();
