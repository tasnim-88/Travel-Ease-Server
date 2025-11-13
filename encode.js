// encode.js
const fs = require("fs");
const key = fs.readFileSync("./travel-ease-d61e9-firebase-adminsdk-fbsvc-6eb5a25a25.json", "utf8");
const base64 = Buffer.from(key).toString("base64");
console.log(base64);