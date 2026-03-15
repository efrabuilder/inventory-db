-- schema.sql — Inventory DB System
-- Efraín Rojas Artavia

-- Products table
CREATE TABLE IF NOT EXISTS categories (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL,
    sku          TEXT    NOT NULL UNIQUE,
    description  TEXT    DEFAULT '',
    category_id  INTEGER REFERENCES categories(id),
    price        REAL    NOT NULL DEFAULT 0,
    stock        INTEGER NOT NULL DEFAULT 0,
    min_stock    INTEGER NOT NULL DEFAULT 5,
    unit         TEXT    DEFAULT 'unit',
    created_at   TEXT    DEFAULT (datetime('now')),
    updated_at   TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id  INTEGER NOT NULL REFERENCES products(id),
    type        TEXT    NOT NULL CHECK(type IN ('in','out','adjustment')),
    quantity    INTEGER NOT NULL,
    reason      TEXT    DEFAULT '',
    created_at  TEXT    DEFAULT (datetime('now'))
);

-- Stored procedure equivalent: trigger to update stock
CREATE TRIGGER IF NOT EXISTS trg_stock_in
AFTER INSERT ON stock_movements
WHEN NEW.type = 'in'
BEGIN
    UPDATE products
    SET stock = stock + NEW.quantity,
        updated_at = datetime('now')
    WHERE id = NEW.product_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_stock_out
AFTER INSERT ON stock_movements
WHEN NEW.type = 'out'
BEGIN
    UPDATE products
    SET stock = MAX(0, stock - NEW.quantity),
        updated_at = datetime('now')
    WHERE id = NEW.product_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_stock_adjustment
AFTER INSERT ON stock_movements
WHEN NEW.type = 'adjustment'
BEGIN
    UPDATE products
    SET stock = NEW.quantity,
        updated_at = datetime('now')
    WHERE id = NEW.product_id;
END;
