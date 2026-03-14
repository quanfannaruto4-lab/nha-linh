const express = require("express");
const https = require("https");

const app = express();

app.get("/", (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  https.get(`https://ipapi.co/${ip}/json/`, (resp) => {
    let data = "";

    resp.on("data", chunk => {
      data += chunk;
    });

    resp.on("end", () => {
      const info = JSON.parse(data);

      const city = info.city;
      const country = info.country_name;

      console.log("IP:", ip);
      console.log("City:", city);

      res.send(`IP: ${ip} <br> Thành phố: ${city} <br> Quốc gia: ${country}`);
    });

  }).on("error", () => {
    res.send("Không tra được IP");
  });
});

app.listen(3000);
