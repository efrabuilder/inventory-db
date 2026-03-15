// pages/api/report/index.js
import { getDb, query } from "../../../lib/db";

export default async function handler(req, res) {
  const db = await getDb();
  const products   = query(db, "SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id");
  const low_stock  = products.filter(p => p.stock <= p.min_stock);
  const total_value = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const movements  = query(db, "SELECT * FROM stock_movements ORDER BY created_at DESC LIMIT 20");
  res.json({ products, low_stock, total_value, movements, total_products: products.length });
}
