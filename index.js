const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

console.log(process.env.NODE_ENV, process.env.PORT);
