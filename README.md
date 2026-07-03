# SportShop Graduation

Website ban do the thao tich hop gio hang, dat hang, admin dashboard va chat realtime.

## Cong nghe

- Backend: Java 17, Spring Boot 3.3, Spring Security, JWT, JPA, PostgreSQL, WebSocket/STOMP
- Frontend: React, Vite, TailwindCSS, Axios, React Router, Recharts
- Database migration/seed: Hibernate update + DataSeeder, co san Flyway migration
- API docs: Swagger UI

## Chuc nang chinh

### Khach hang

- Dang ky, dang nhap, refresh token, logout
- Quen mat khau, dat lai mat khau, doi mat khau
- Xem danh sach san pham, loc theo keyword/category/brand/gia, sap xep
- Xem chi tiet san pham, anh san pham, size, so luong, review, san pham lien quan
- Them gio hang, cap nhat so luong, xoa san pham, ap dung coupon
- Checkout, chon dia chi, chon giao hang, chon thanh toan COD/chuyen khoan/vi demo
- Xem lich su don hang, chi tiet don hang, timeline trang thai, huy don
- Chat realtime voi admin

### Admin

- Dashboard tong quan
- Quan ly user
- Quan ly category, brand, product
- Upload anh san pham tu trang admin
- Quan ly ton kho va inventory log
- Quan ly order, cap nhat trang thai don va thanh toan
- Quan ly coupon
- Bao cao doanh thu, bieu do, export CSV
- Quan ly chat voi khach hang

## Yeu cau cai dat

- Java 17
- Maven 3.9+
- Node.js 20+
- PostgreSQL 14+ hoac Docker Desktop

Kiem tra nhanh:

```powershell
java -version
mvn -version
node -v
npm -v
```

Luu y: nen dung Java 17. Neu may dang dung Java 25, hay set `JAVA_HOME` ve JDK 17 truoc khi chay backend.

## Clone project

```bash
git clone https://github.com/hieulmallsoft-hub/ChiHung.git
cd ChiHung
```

## Cach 1: Chay voi PostgreSQL cai san tren may

Tao database:

```sql
CREATE DATABASE sportshop_graduation;
```

Mac dinh backend doc cau hinh trong `backend/src/main/resources/application.yml`:

```yaml
DB_URL=jdbc:postgresql://localhost:5432/sportshop_graduation
DB_USERNAME=postgres
DB_PASSWORD=123456
```

Neu PostgreSQL cua ban dung password khac, set bien moi truong truoc khi chay backend:

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/sportshop_graduation"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="mat_khau_postgres_cua_ban"
```

## Cach 2: Chay PostgreSQL bang Docker

Tai thu muc root project:

```powershell
docker compose up -d
```

File `docker-compose.yml` expose PostgreSQL o port `5433`, database `sportshop_db`, user `postgres`, password `123456`.

Khi chay backend voi Docker DB, set:

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5433/sportshop_db"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="123456"
```

## Chay backend

Mo terminal tai thu muc project:

```powershell
cd backend
```

Neu can ep dung JDK 17 tren may Windows:

```powershell
$env:JAVA_HOME="C:\Users\Admin\tools\temurin-17\jdk-17.0.18+8"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
```

Chay backend:

```powershell
mvn spring-boot:run
```

Backend mac dinh:

- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html
- Health: http://localhost:8080/actuator/health
- Upload files: `backend/uploads`

Neu port 8080 bi trung:

```powershell
netstat -ano | findstr :8080
Stop-Process -Id <PID> -Force
```

Hoac chay port khac:

```powershell
mvn spring-boot:run "-Dspring-boot.run.arguments=--server.port=8081"
```

## Chay frontend

Mo terminal khac tai thu muc project:

```powershell
cd frontend
npm install
npm run dev
```

Frontend mac dinh:

- http://localhost:5173

Neu Vite tu doi sang port khac, vi du `5174`, backend da cho phep CORS tu cac port localhost dev.

Neu backend khong chay o `8080`, tao file `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8081
VITE_WS_BASE_URL=http://localhost:8081
```

Sau do restart frontend.

## Tai khoan demo

Backend tu tao role va tai khoan admin mac dinh khi database chua co admin. Du lieu demo day du nhu user mau, danh muc, thuong hieu, san pham va coupon nam trong `backend/sql/sample_data.sql`.

Neu dung PostgreSQL local:

```powershell
psql -h localhost -p 5432 -U postgres -d sportshop_graduation -f backend/sql/sample_data.sql
```

Neu dung PostgreSQL Docker trong project:

```powershell
psql -h localhost -p 5433 -U postgres -d sportshop_db -f backend/sql/sample_data.sql
```

```text
Admin: admin@sportshop.vn / admin123
User:  user1@sportshop.vn / user123
User:  user2@sportshop.vn / user123
```

Trang dang nhap admin:

```text
http://localhost:5173/admin-login
```

## Luong test nhanh

1. Vao `/products`, tim kiem/loc/sap xep san pham.
2. Bam san pham de vao chi tiet.
3. Dang nhap user.
4. Them vao gio hoac bam mua ngay.
5. Vao `/cart`, ap coupon `SPORT10` hoac `FREESHIP50`.
6. Checkout, chon dia chi, giao hang, phuong thuc thanh toan.
7. Vao `/orders` de xem don hang.
8. Dang nhap admin, vao dashboard, products, coupons, orders, reports, chats.

## Lenh build kiem tra

Backend:

```powershell
cd backend
mvn -DskipTests package
```

Frontend:

```powershell
cd frontend
npm run build
```

## Loi thuong gap

### Port 8080 was already in use

Backend dang co process khac chay o port 8080.

```powershell
netstat -ano | findstr :8080
Stop-Process -Id <PID> -Force
```

### Khong thay san pham tren frontend

Kiem tra backend:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:8080/api/public/products
```

Neu API tra `200` nhung frontend bao loi, restart backend va frontend. Neu frontend dung port khac `5173`, backend hien da cho phep CORS localhost dev ports.

### Maven loi voi Java 25

Dung Java 17:

```powershell
$env:JAVA_HOME="duong_dan_toi_jdk_17"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
mvn spring-boot:run
```

### Database connection failed

Kiem tra dung DB URL, username, password. Neu dung Docker DB:

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5433/sportshop_db"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="postgres"
```

## Ghi chu

- Thanh toan VNPay/Momo/Stripe that chua cau hinh merchant key. Hien tai co COD, chuyen khoan va vi dien tu demo.
- Anh upload tu admin duoc luu local trong `backend/uploads`.
- Neu clone ve may moi, database trong thi DataSeeder se tao san du lieu demo.
