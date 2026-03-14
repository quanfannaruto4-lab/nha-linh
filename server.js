const express = require("express");

const app = express();

let visitors = [];

app.get("/", async (req, res) => {

  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  const response = await fetch(`https://ipapi.co/${ip}/json/`);
  const data = await response.json();

  const visitor = {
    ip: ip,
    city: data.city,
    country: data.country_name,
    lat: data.latitude,
    lon: data.longitude,
    device: req.headers["user-agent"],
    time: new Date().toLocaleString()
  };

  visitors.push(visitor);

  res.send(`
  IP: ${ip}<br>
  City: ${data.city}<br>
  <a href="/dashboard">Dashboard</a>
  `);

});

app.get("/dashboard", (req, res) => {

  let html = "<h1>Visitors</h1>";

  visitors.forEach(v => {
    html += `
    <p>
    IP: ${v.ip}<br>
    City: ${v.city}<br>
    Time: ${v.time}<br>
    <a href="https://www.google.com/maps?q=${v.lat},${v.lon}" target="_blank">
    Map
    </a>
    </p>
    <hr>
    `;
  });

  res.send(html);

});

app.listen(3000, () => {
  console.log("Server running");
});
