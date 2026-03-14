const express = require("express");

const app = express();

app.get("/", async (req, res) => {

  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || "8.8.8.8";

  try {

    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();

    res.send(`
      <h2>IP Info</h2>
      IP: ${ip}<br>
      City: ${data.city}<br>
      Country: ${data.country}<br>
      Latitude: ${data.lat}<br>
      Longitude: ${data.lon}<br><br>

      <a href="https://www.google.com/maps?q=${data.lat},${data.lon}" target="_blank">
      Xem vị trí trên Google Maps
      </a>
    `);

  } catch (err) {

    console.log(err);
    res.send("Error getting IP info");

  }

});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
