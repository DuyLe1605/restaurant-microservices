@echo off
chcp 65001 >nul
echo ========================================================
echo   DỪNG TẤT CẢ SPRING BOOT MICROSERVICES
echo ========================================================

for %%p in (8761 8080 8081 8082 8083 8084 8085 8086 8087) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING') do (
        echo Đang tắt tiến trình PID %%a trên cổng %%p...
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo.
echo Đã tắt các tiến trình Spring Boot thành công!
pause
