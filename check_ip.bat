@echo off
chcp 65001 >nul
echo ========================================================
echo    SNACK SHOP - KIEM TRA IP & KET NOI BACKEND
echo ========================================================
echo.
echo [1] Cac dia chi IP hien tai cua may tinh:
powershell -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback|vEthernet|Virtual' } | Select-Object IPAddress, InterfaceAlias | Format-Table -AutoSize"
echo.
echo [2] Kiem tra Backend .NET tren cong 5000:
powershell -Command "try { $res = Invoke-RestMethod -Uri 'http://localhost:5000/api/san-pham?pageSize=1' -Method Get -TimeoutSec 3; Write-Host '>>> BACKEND DANG HOAT DONG TOT (200 OK)' -ForegroundColor Green } catch { Write-Host '>>> BACKEND CHUA CHAY HOAC DANG BI LOI: ' $_.Exception.Message -ForegroundColor Red }"
echo.
echo ========================================================
pause

