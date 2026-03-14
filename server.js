const express = require("express");
// const fetch = require("node-fetch"); // Bỏ comment nếu dùng Node.js < 18

const app = express();
let visitors = [];

app.get("/", async (req, res) => {
  // Lấy IP thật (tránh lấy IP của Proxy/Server)
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress ||
    "8.8.8.8";

  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();

    const visitor = {
      ip: ip,
      city: data.city || "Unknown",
      country: data.country_name || "Unknown",
      lat: data.latitude,
      lon: data.longitude,
      time: new Date().toLocaleString("vi-VN")
    };

    // Chỉ lưu nếu lấy được tọa độ thành công
    if (data.latitude) {
      visitors.push(visitor);
    }

    res.send(`
      <body style="font-family: sans-serif; padding: 20px;">
        <h2>Thông tin IP của bạn</h2>
        <p><b>IP:</b> ${visitor.ip}</p>
        <p><b>Thành phố:</b> ${visitor.city}</p>
        <p><b>Quốc gia:</b> ${visitor.country}</p>
        <p><b>Tọa độ:</b> ${visitor.lat}, ${visitor.lon}</p>
        
        <br>
        <a href="https://www.google.com/maps?q=${visitor.lat},${visitor.lon}" target="_blank" 
           style="padding: 10px; background: #4285F4; color: white; text-decoration: none; border-radius: 5px;">
           Mở Google Maps
        </a>

        <br><br>
        <a href="/dashboard">Xem danh sách truy cập</a>
      </body>
    `);
  } catch (e) {
    res.status(500).send("Lỗi khi lấy thông tin vị trí.");
  }
});

app.get("/dashboard", (req, res) => {
  let tableRows = visitors
    .map(v => `
      <tr>
        <td>${v.ip}</td>
        <td>${v.city}</td>
        <td>${v.country}</td>
        <td><a href="https://www.google.com/maps?q=${v.lat},${v.lon}" target="_blank">${v.lat}, ${v.lon}</a></td>
        <td>${v.time}</td>
      </tr>
    `)
    .reverse() // Hiện người mới nhất lên đầu
    .join("");

  res.send(`
    <body style="font-family: sans-serif; padding: 20px;">
      <h2>Danh sách người truy cập</h2>
      <table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">
        <tr style="background: #eee;">
          <th>IP</th>
          <th>Thành phố</th>
          <th>Quốc gia</th>
          <th>Tọa độ (Click xem Maps)</th>
          <th>Thời gian</th>
        </tr>
        ${tableRows || '<tr><td colspan="5" style="text-align:center;">Chưa có dữ liệu</td></tr>'}
      </table>
      <br>
      <a href="/">Quay lại</a>
    </body>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
