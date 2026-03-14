const express = require("express");
const https = require("https");
const fetch = require("node-fetch");

const app = express();

app.get("/", (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
app.get("/", async (req, res) => {

  https.get(`https://ipapi.co/${ip}/json/`, (resp) => {
    let data = "";
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

    resp.on("data", chunk => {
      data += chunk;
    });
  try {

    resp.on("end", () => {
      const info = JSON.parse(data);
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();

      const city = info.city;
      const country = info.country_name;
    const city = data.city;
    const country = data.country_name;
    const lat = data.latitude;
    const lon = data.longitude;

      console.log("IP:", ip);
      console.log("City:", city);
    console.log("IP:", ip);
    console.log("City:", city);
    console.log("Coordinates:", lat, lon);

      res.send(`IP: ${ip} <br> Thành phố: ${city} <br> Quốc gia: ${country}`);
    });
    res.send(`
      <h2>Visitor Info</h2>
      IP: ${ip} <br>
      City: ${city} <br>
      Country: ${country} <br>
      Latitude: ${lat} <br>
      Longitude: ${lon} <br><br>

      <a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank">
      Xem vị trí trên Google Maps
      </a>
    `);

  } catch (error) {
    res.send("Không lấy được vị trí IP");
  }

  }).on("error", () => {
    res.send("Không tra được IP");
  });
});

app.listen(3000);
app.listen(3000, () => {
  console.log("Server running...");
});
