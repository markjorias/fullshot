-- schema_menu.sql
-- Database schema for managing the coffee shop menu

CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT CHECK(category IN ('ICE COFFEE', 'HOT DRINKS', 'NON COFFEE', 'LIGHT BITE SNACKS', 'NINETY-NINERS', 'ADD-ONS', 'RICE MEALS')),
    image_url TEXT,
    variations TEXT, -- Comma-separated or JSON
    sizes TEXT,      -- Comma-separated or JSON
    addons TEXT,     -- JSON array of addon item IDs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS featured_items (
    section TEXT PRIMARY KEY, -- 'bestseller', 'snacks', 'more_to_try'
    item_ids TEXT NOT NULL    -- JSON array of menu_item IDs
);

-- Initial featured items
INSERT OR IGNORE INTO featured_items (section, item_ids) VALUES ('bestseller', '[]');
INSERT OR IGNORE INTO featured_items (section, item_ids) VALUES ('snacks', '[]');
INSERT OR IGNORE INTO featured_items (section, item_ids) VALUES ('more_to_try', '[]');

-- Initial data seed
INSERT INTO menu_items (name, description, price, category, image_url) 
VALUES ('Hazelnut Latte', 'Smooth and nutty latte available in different sizes.', 100.00, 'NON COFFEE', 'https://www.figma.com/api/mcp/asset/e0e64626-ca4a-4e32-9a95-f78972e62b6a');
