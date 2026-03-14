const express = require("express");

const app = express();

let visitors = [];

app.get("/", async (req, res) => {

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress;

  try {

    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();

    visitors.push({
      ip: ip,
      city: data.city,
      lat: data.latitude,
      lon: data.longitude,
      time: new Date().toLocaleString()
    });

    res.send(`
      IP: ${ip}<br>
      City: ${data.city}<br><br>
      <a href="/dashboard">Dashboard</a>
    `);

  } catch (e) {
    res.send("Error getting IP info");
  }

});

app.get("/dashboard", (req, res) => {

  let html = "<h1>Visitors</h1>";

  visitors.forEach(v => {
    html += `
      IP: ${v.ip}<br>
      City: ${v.city}<br>
      Time: ${v.time}<br>
      <a href="https://www.google.com/maps?q=${v.lat},${v.lon}" target="_blank">Map</a>
      <hr>
    `;
  });

  res.send(html);

});

app.listen(3000, () => {
  console.log("Server running");
});
