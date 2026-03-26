# SportShop Graduation Project

Do an tot nghiep: **Xay dung website ban do the thao tich hop chat realtime**

Tech stack:
- Backend: Java 17 + Spring Boot 3 + PostgreSQL + JWT + WebSocket/STOMP
- Frontend: ReactJS (Vite) + TailwindCSS + Axios + Context API
- DB migration: Flyway
- API docs: Swagger/OpenAPI (`/swagger-ui.html`)

---

## 1) Phan tich bai toan

### Bai toan
Can xay dung he thong ecommerce do the thao day du cho:
- Khach hang: tim/mua hang, quan ly tai khoan, don hang, chat ho tro
- Quan tri vien: quan ly user/catalog/order/inventory/report/chat

### Muc tieu
- Chay duoc end-to-end khi demo bao ve
- Kien truc tach frontend/backend ro rang
- API RESTful de mo rong
- Bao mat JWT + Refresh Token + RBAC (`ROLE_USER`, `ROLE_ADMIN`)

### Chuc nang da trien khai
- Auth: register/login/logout/refresh/forgot/reset/change password
- User profile + address
- Product list/detail/search/filter/sort/related
- Cart + coupon + checkout
- Order flow + payment mock + cancel/restore inventory
- Review (chi user da mua don DELIVERED)
- Admin dashboard + CRUD management + report
- Realtime chat user-admin + luu lich su chat

---

## 2) De xuat kien truc he thong

### Kien truc tong quan
- Frontend (React) goi REST API backend
- Backend Spring Boot xu ly business logic + DB
- WebSocket/STOMP cho chat realtime
- PostgreSQL luu du lieu giao dich

### Kien truc backend (layered)
- `controller` / `controller.admin` / `controller.publicapi`
- `service` + `service.impl`
- `repository`
- `entity`
- `dto`
- `mapper`
- `security`
- `exception`
- `websocket`
- `seed`

### Bao mat
- Access token + refresh token
- BCrypt hash password
- Security filter + method/route based authorization
- CORS config cho frontend

---

## 3) Thiet ke database

- Migration: `backend/src/main/resources/db/migration/V1__init_schema.sql`
- ERD text: [docs/ERD.md](./docs/ERD.md)

Bang chinh:
- `users`, `roles`, `user_roles`, `addresses`, `refresh_tokens`
- `categories`, `brands`, `products`, `product_images`, `inventory_logs`
- `carts`, `cart_items`
- `coupons`, `coupon_usages`
- `orders`, `order_items`, `payments`, `reviews`
- `chat_rooms`, `messages`

Quan he da toi uu index cho field tim kiem thong dung (`email`, `sku`, `order_code`, `status`, ...).

---

## 4) Cay thu muc du an

```text
sportshop-graduation/
+- backend/
¦  +- pom.xml
¦  +- src/main/java/com/sportshop/
¦  ¦  +- config/
¦  ¦  +- controller/
¦  ¦  ¦  +- admin/
¦  ¦  ¦  +- publicapi/
¦  ¦  +- dto/
¦  ¦  +- entity/
¦  ¦  +- enums/
¦  ¦  +- exception/
¦  ¦  +- mapper/
¦  ¦  +- repository/
¦  ¦  +- security/
¦  ¦  +- service/
¦  ¦  +- specification/
¦  ¦  +- util/
¦  ¦  +- websocket/
¦  ¦  +- seed/
¦  +- src/main/resources/
¦  ¦  +- application.yml
¦  ¦  +- db/migration/V1__init_schema.sql
¦  +- sql/sample_data.sql
+- frontend/
¦  +- package.json
¦  +- index.html
¦  +- vite.config.js
¦  +- tailwind.config.js
¦  +- src/
¦     +- api/
¦     +- components/
¦     +- contexts/
¦     +- hooks/
¦     +- pages/admin/
¦     +- pages/user/
¦     +- routes/
¦     +- utils/
+- docs/
¦  +- ERD.md
¦  +- API.md
+- docker-compose.yml
```

---

## 5) Huong dan chay du an

### 5.1. Yeu cau cai dat
- Java 17+
- Maven 3.9+
- Node.js 20+
- PostgreSQL 14+

### 5.2. Chay PostgreSQL (nhanh)
```bash
docker compose up -d
```

### 5.3. Chay backend
```bash
cd backend
mvn spring-boot:run
```

Backend mac dinh:
- `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui.html`

### 5.4. Chay frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend mac dinh:
- `http://localhost:5173`

---

## 6) Du lieu mau + tai khoan demo

Du lieu mau tu dong seed boi `DataSeeder` khi DB trong.

Tai khoan demo:
- Admin: `admin@sportshop.vn` / `admin123`
- User: `user1@sportshop.vn` / `user123`
- User: `user2@sportshop.vn` / `user123`

Du lieu demo bao gom:
- 10 users
- 6 categories
- 8 brands
- 24 products do the thao
- 2 coupons
- 3 don hang demo
- 1 room chat demo

Neu can seed bang SQL thu cong:
- Chay file: [backend/sql/sample_data.sql](./backend/sql/sample_data.sql)

---

## 7) API chinh theo module

Chi tiet: [docs/API.md](./docs/API.md)

### Vi du request/response

#### Login
`POST /api/auth/login`

Request:
```json
{
  "email": "admin@sportshop.vn",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login success",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "tokenType": "Bearer",
    "expiresInSeconds": 3600,
    "user": {
      "id": "...",
      "email": "admin@sportshop.vn",
      "fullName": "Admin System",
      "roles": ["ROLE_ADMIN"]
    }
  }
}
```

#### Checkout
`POST /api/orders/checkout`

Request:
```json
{
  "addressId": "<address_uuid>",
  "paymentMethod": "COD",
  "couponCode": "SPORT10",
  "note": "Giao gio hanh chinh"
}
```

#### Gui tin nhan chat
`POST /api/chat/messages`

Request:
```json
{
  "roomId": "<room_uuid>",
  "content": "Em can tu van giay chay bo"
}
```

---

## 8) Test nhanh luong demo bao ve

1. Dang nhap user -> xem products -> add cart -> checkout -> xem order history.
2. Dang nhap admin -> vao dashboard -> cap nhat trang thai don.
3. User/Admin vao chat -> gui/nhan tin nhan realtime.
4. Admin vao inventory -> adjust stock -> xem logs.
5. Admin vao report -> xem doanh thu + top products.

---

## 9) Ghi chu

- Backend da co full source theo mo hinh enterprise co ban (DTO, service layer, exception handler, security, seed data).
- Frontend da tach route user/admin, co auth guard va token refresh interceptor.
- Payment dang o che do mock (co `payment_status` va luong cap nhat ro rang).
- Build frontend thanh cong (`npm run build`).
- Moi truong hien tai khong co Maven command, nen chua verify compile backend bang local build command trong session nay.
