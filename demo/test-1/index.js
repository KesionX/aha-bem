const { transform } = require("../../dist").default();
const fs = require("fs");
const path = require("path");

const { code } = transform(
  fs.readFileSync(path.resolve(__dirname, "./index.vue"), "utf-8"),
  "sss.vue"
);

console.log(code);
