@echo off
chcp 65001 >nul
echo ========================================================
echo   KHỞI ĐỘNG TOÀN BỘ HỆ THỐNG RESTAURANT MICROSERVICES
echo ========================================================
echo.

echo [1/3] Đang bật 7 MySQL databases và RabbitMQ (Docker)...
docker start mysql-auth mysql-user mysql-menu mysql-inventory mysql-order mysql-table mysql-report rabbitmq

echo.
echo [2/3] Đang khởi động Eureka Service Discovery (Port 8761)...
start "1. Service Discovery [8761]" cmd /k "cd /d %~dp0 && call mvn spring-boot:run -pl service-discovery"

echo Đang chờ Eureka khởi động (12 giây)...
ping 127.0.0.1 -n 12 >nul

echo.
echo [3/3] Đang khởi động các Microservices & Gateway...
start "2. API Gateway [8080]" cmd /k "cd /d %~dp0 && call mvn spring-boot:run -pl api-gateway"
ping 127.0.0.1 -n 5 >nul

start "3. Auth Service [8081]" cmd /k "cd /d %~dp0 && call mvn spring-boot:run -pl auth-service"
start "4. User Service [8082]" cmd /k "cd /d %~dp0 && call mvn spring-boot:run -pl user-service"
start "5. Table Service [8086]" cmd /k "cd /d %~dp0 && call mvn spring-boot:run -pl table-service"
start "6. Order Service [8085]" cmd /k "cd /d %~dp0 && call mvn spring-boot:run -pl order-service"
start "7. Menu Service [8083]" cmd /k "cd /d %~dp0 && call mvn spring-boot:run -pl menu-service"
start "8. Inventory Service [8084]" cmd /k "cd /d %~dp0 && call mvn spring-boot:run -pl inventory-service"
start "9. Report Service [8087]" cmd /k "cd /d %~dp0 && call mvn spring-boot:run -pl report-service"

echo.
echo ========================================================
echo  Tất cả các service đã được mở trong các cửa sổ riêng biệt!
echo  - Cổng 8761: Eureka Dashboard (http://localhost:8761)
echo  - Cổng 8080: API Gateway (http://localhost:8080)
echo  - Cổng 5173: Frontend Web (http://localhost:5173)
echo ========================================================
pause
