CREATE EXTENSION IF NOT EXISTS unaccent;

ALTER TABLE products ADD COLUMN IF NOT EXISTS search_text VARCHAR(1000);

UPDATE products p
SET search_text = lower(unaccent(concat_ws(' ', p.name, p.sku, c.name, b.name, p.short_description)))
FROM categories c, brands b
WHERE p.category_id = c.id
  AND p.brand_id = b.id
  AND p.search_text IS NULL;

CREATE INDEX IF NOT EXISTS idx_products_search_text ON products(search_text);

CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    status VARCHAR(30) NOT NULL,
    changed_by VARCHAR(30) NOT NULL,
    note VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_order_status_history_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order
    ON order_status_history(order_id, created_at);
