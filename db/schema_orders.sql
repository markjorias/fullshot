-- schema_orders.sql
-- Database schema for managing customer orders

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY, -- e.g., 'ORD-001'
    customer_name TEXT NOT NULL,
    total_price REAL NOT NULL,
    status TEXT CHECK(status IN ('Received', 'Confirmed', 'Preparing', 'Ready', 'Completed')) DEFAULT 'Received',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id TEXT,
    item_id INTEGER,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (item_id) REFERENCES menu_items(id)
);

-- Example data seed
INSERT INTO orders (id, customer_name, total_price, status) 
VALUES ('ORD-001', 'John Doe', 350.00, 'Received');

INSERT INTO order_items (order_id, item_id, quantity) 
VALUES ('ORD-001', 1, 2);
