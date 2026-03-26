# ERD (Text)

## Core Identity
- `users` n-n `roles` qua `user_roles`
- `users` 1-n `addresses`
- `users` 1-1 `carts`
- `users` 1-n `orders`
- `users` 1-n `refresh_tokens`

## Catalog
- `categories` 1-n `products`
- `brands` 1-n `products`
- `products` 1-n `product_images`
- `products` 1-n `inventory_logs`
- `products` 1-n `reviews`

## Shopping & Order
- `carts` 1-n `cart_items`
- `products` 1-n `cart_items`
- `orders` 1-n `order_items`
- `products` 1-n `order_items`
- `orders` 1-1 `payments`
- `coupons` 1-n `orders`
- `coupons` 1-n `coupon_usages`
- `users` 1-n `coupon_usages`

## Chat
- `users`(customer) 1-n `chat_rooms`
- `users`(admin) 1-n `chat_rooms.assigned_admin_id`
- `chat_rooms` 1-n `messages`
- `users` 1-n `messages` (sender)

## Business Notes
- Soft delete: `users`, `categories`, `brands`, `products`
- Inventory update when checkout/cancel
- Review chi cho user da co don giao thanh cong (`DELIVERED`)
