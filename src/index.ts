import express from "express";
import dotenv from "dotenv";

// dotenv.config({ path: "../config/config.env" });
dotenv.config({ path: "./config/config.env" });

const app = express();

const PORT = process.env.PORT || 6000;
console.log("process.env.PORT: ", process.env.PORT);
console.log("process.env.NODE_ENV: ", process.env.NODE_ENV);

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
