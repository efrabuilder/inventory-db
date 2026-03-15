// lib/db.js
import initSqlJs from "sql.js";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "inventory.db");
let db = null;

export async function getDb() {
  if (db) return db;
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
    initSchema(db);
    save(db);
  }
  return db;
}

export function save(database) {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, Buffer.from(database.export()));
}

function initSchema(database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      sku         TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      category_id INTEGER REFERENCES categories(id),
      price       REAL NOT NULL DEFAULT 0,
      stock       INTEGER NOT NULL DEFAULT 0,
      min_stock   INTEGER NOT NULL DEFAULT 5,
      unit        TEXT DEFAULT 'unit',
      created_at  TEXT DEFAULT (datetime('now')),
      updated_at  TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS stock_movements (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id),
      type       TEXT NOT NULL,
      quantity   INTEGER NOT NULL,
      reason     TEXT DEFAULT '',
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
}

export function query(database, sql, params = []) {
  const stmt = database.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

export function run(database, sql, params = []) {
  database.run(sql, params);
  save(database);
}
