# API Overview

Base URL: `http://localhost:8080`
Swagger: `/swagger-ui.html`

## Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

## Public Catalog
- `GET /api/public/categories`
- `GET /api/public/brands`
- `GET /api/public/products`
- `GET /api/public/products/{id}`
- `GET /api/public/products/{id}/related`

## User
- `GET /api/users/me`
- `PUT /api/users/me`
- `POST /api/users/change-password`
- `GET/POST/PUT/DELETE /api/users/me/addresses`

## Cart
- `GET /api/cart`
- `POST /api/cart/items`
- `PUT /api/cart/items/{id}`
- `DELETE /api/cart/items/{id}`
- `POST /api/cart/coupon/{code}`
- `DELETE /api/cart/coupon`

## Order
- `POST /api/orders/checkout`
- `GET /api/orders/me`
- `GET /api/orders/me/{id}`
- `POST /api/orders/me/{id}/cancel`
- `GET /api/orders/me/stats`

## Review
- `POST /api/reviews`
- `GET /api/reviews/product/{productId}`

## Chat
- `POST /api/chat/rooms/open`
- `GET /api/chat/rooms/me`
- `GET /api/chat/rooms/{roomId}/messages`
- `POST /api/chat/messages`
- `POST /api/chat/rooms/{roomId}/read`
- WebSocket endpoint: `/ws`, topic: `/topic/chat/{roomId}`, app destination: `/app/chat.send`

## Admin
- `GET /api/admin/dashboard`
- `CRUD /api/admin/users`
- `CRUD /api/admin/categories`
- `CRUD /api/admin/brands`
- `CRUD /api/admin/products`
- `PUT /api/admin/inventory/products/{productId}`
- `GET /api/admin/inventory/products/{productId}/logs`
- `GET /api/admin/orders`
- `PUT /api/admin/orders/{id}/status`
- `PUT /api/admin/orders/{id}/payment`
- `GET /api/admin/reports/revenue`
- `GET /api/admin/chats/rooms`
- `PUT /api/admin/chats/rooms/{roomId}/resolve`
