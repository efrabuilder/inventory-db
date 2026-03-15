// scripts/initDb.js
const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/inventory.db");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

initSqlJs().then(SQL => {
  const db = new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, sku TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '', category_id INTEGER,
      price REAL NOT NULL DEFAULT 0, stock INTEGER NOT NULL DEFAULT 0,
      min_stock INTEGER NOT NULL DEFAULT 5, unit TEXT DEFAULT 'unit',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS stock_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL, type TEXT NOT NULL,
      quantity INTEGER NOT NULL, reason TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TRIGGER IF NOT EXISTS trg_stock_in
    AFTER INSERT ON stock_movements WHEN NEW.type='in'
    BEGIN UPDATE products SET stock=stock+NEW.quantity, updated_at=datetime('now') WHERE id=NEW.product_id; END;
    CREATE TRIGGER IF NOT EXISTS trg_stock_out
    AFTER INSERT ON stock_movements WHEN NEW.type='out'
    BEGIN UPDATE products SET stock=MAX(0,stock-NEW.quantity), updated_at=datetime('now') WHERE id=NEW.product_id; END;
    CREATE TRIGGER IF NOT EXISTS trg_stock_adjustment
    AFTER INSERT ON stock_movements WHEN NEW.type='adjustment'
    BEGIN UPDATE products SET stock=NEW.quantity, updated_at=datetime('now') WHERE id=NEW.product_id; END;
  `);

  // Categories
  const cats = ["Electronics","Office Supplies","Networking","Software","Hardware"];
  cats.forEach(c => db.run("INSERT OR IGNORE INTO categories(name) VALUES(?)", [c]));

  // Products
  const products = [
    ["Laptop Dell Latitude 5540", "LAP-001", "Business laptop 15\"", 1, 850.00, 12, 3, "unit"],
    ["Wireless Mouse Logitech",   "MOU-001", "Ergonomic wireless mouse", 1, 25.00, 45, 10, "unit"],
    ["USB-C Hub 7-port",          "HUB-001", "7-port USB-C hub",    1, 35.00, 3, 5, "unit"],
    ["A4 Paper 500 sheets",       "PAP-001", "Office paper ream",   2, 8.50,  80, 20, "ream"],
    ["Stapler Heavy Duty",        "STA-001", "Heavy duty stapler",  2, 15.00, 8, 3, "unit"],
    ["Cat6 Cable 10m",            "CAB-001", "Ethernet Cat6 cable", 3, 12.00, 25, 10, "unit"],
    ["Network Switch 24p",        "SWT-001", "24-port managed switch", 3, 320.00, 2, 2, "unit"],
    ["Patch Panel 24p",           "PAT-001", "24-port patch panel", 3, 85.00, 4, 2, "unit"],
    ["Antivirus License",         "ANT-001", "Annual license",      4, 45.00, 15, 5, "license"],
    ["Office 365 Business",       "OFF-001", "Annual subscription", 4, 120.00, 20, 5, "license"],
    ["RAM DDR4 16GB",             "RAM-001", "16GB DDR4 3200MHz",   5, 55.00, 2, 5, "unit"],
    ["SSD 500GB",                 "SSD-001", "NVMe SSD 500GB",      5, 65.00, 6, 3, "unit"],
  ];

  products.forEach(p => {
    db.run(`INSERT OR IGNORE INTO products(name,sku,description,category_id,price,stock,min_stock,unit)
            VALUES(?,?,?,?,?,?,?,?)`, p);
  });

  // Sample movements
  const movements = [
    [1, "in", 10, "Initial stock"],
    [3, "out", 2, "Sold to client"],
    [7, "in", 3, "Purchase order #42"],
    [11, "out", 3, "IT department request"],
    [4, "in", 50, "Bulk purchase"],
  ];
  movements.forEach(m => db.run(
    "INSERT INTO stock_movements(product_id,type,quantity,reason) VALUES(?,?,?,?)", m
  ));

  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
  db.close();
  console.log("✅ Inventory database initialized with sample data.");
});
