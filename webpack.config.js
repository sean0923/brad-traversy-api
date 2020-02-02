var path = require("path");

module.exports = {
  // the main source code file
  entry: "./src/index.ts",
  output: {
    // the output file name
    filename: "bundle.js",
    // the output path
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      // all files with a `.ts` extension will be handled by `ts-loader`
      { test: /\.ts$/, loader: "ts-loader" }
    ]
  },
  target: "node"
};
