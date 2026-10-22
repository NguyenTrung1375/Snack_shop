@echo off
chcp 65001 >nul
echo ========================================================
echo    SNACK SHOP - MO CONG PUBLIC HTTPS CHO BACKEND
echo    (Giup dien thoai ket noi 4G hoac moi Wi-Fi khong lo doi IP)
echo ========================================================
echo.
echo Dang tao tunnel toi cong 5000...
echo Vui long copy link https://... duoi day vao App Mobile:
echo.
npx --yes localtunnel --port 5000
pause

