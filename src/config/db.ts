import { connect, connection } from "mongoose";
import config from "./config";

const dbConnect = async () => {
  try {
    connection.on("connected", () => {
      console.log("Connected to database successfully.");
    });
    connection.on("error", (err) => {
      console.error("Error connecting to the database:", err.message);
    });
    connect(config.get("databaseUrl") as string);
  } catch (err) {
    console.error("Failed to connect to the database:", err);
    process.exit(1);
  }
};

export default dbConnect;
