const express = require("express");
const fetch = require("node-fetch");

const app = express();

let visitors = [];

app.get("/", async (req, res) => {

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress ||
    "8.8.8.8";

  try {

    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();

    const visitor = {
      ip: ip,
      city: data.city,
      country: data.country_name,
      lat: data.latitude,
      lon: data.longitude,
      time: new Date().toLocaleString()
    };

    visitors.push(visitor);

    res.send(`
      <h2>IP Info</h2>
      IP: ${visitor.ip}<br>
      City: ${visitor.city}<br>
      Country: ${visitor.country}<br>
      Latitude: ${visitor.lat}<br>
      Longitude: ${visitor.lon}<br><br>

      <a href="https://www.google.com/maps?q=${visitor.lat},${visitor.lon}" target="_blank">
      Xem vị trí trên Google Maps
      </a>

      <br><br>
      <a href="/dashboard">Xem Dashboard</a>
    `);

  } catch (e) {
    res.send("Error getting IP info");
  }

});

app.get("/dashboard", (req, res) => {

  let table = visitors
    .map(v => `
      <tr>
        <td>${v.ip}</td>
        <td>${v.city}</td>
        <td>${v.country}</td>
        <td>${v.lat}, ${v.lon}</td>
        <td>${v.time}</td>
      </tr>
    `)
    .join("");

  res.send(`
    <h2>Visitor Dashboard</h2>

    <table border="1" cellpadding="8">
      <tr>
        <th>IP</th>
        <th>City</th>
        <th>Country</th>
        <th>Coordinates</th>
        <th>Time</th>
      </tr>
      ${table}
    </table>

    <br>
    <a href="/">Back</a>
  `);

});

app.listen(3000, () => {
  console.log("Server running");
});
