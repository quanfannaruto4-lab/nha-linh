const express = require("express");
const fetch = require("node-fetch");

const app = express();

app.get("/", async (req, res) => {

  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  try {

    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();

    const city = data.city;
    const country = data.country_name;
    const lat = data.latitude;
    const lon = data.longitude;

    console.log("IP:", ip);
    console.log("City:", city);
    console.log("Coordinates:", lat, lon);

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

});

app.listen(3000, () => {
  console.log("Server running...");
});
