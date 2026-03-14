const express = require("express");
const app = express();

app.get("/", (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  console.log("Visitor IP:", ip);
  res.send("IP của bạn: " + ip);
});

app.listen(3000, () => {
  console.log("Server running...");
});
