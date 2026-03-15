// pages/api/products/[id].js
import { getDb, query, run } from "../../../lib/db";

export default async function handler(req, res) {
  const db = await getDb();
  const { id } = req.query;

  if (req.method === "GET") {
    const rows = query(db, `
      SELECT p.*, c.name AS category_name FROM products p
      LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    const movements = query(db,
      "SELECT * FROM stock_movements WHERE product_id = ? ORDER BY created_at DESC LIMIT 20", [id]);
    return res.json({ ...rows[0], movements });
  }

  if (req.method === "PATCH") {
    const { name, description, category_id, price, min_stock, unit } = req.body;
    run(db, `UPDATE products SET name=?,description=?,category_id=?,price=?,min_stock=?,unit=?,
             updated_at=datetime('now') WHERE id=?`,
      [name, description, category_id, price, min_stock, unit, id]);
    return res.json({ ok: true });
  }

  if (req.method === "DELETE") {
    run(db, "DELETE FROM stock_movements WHERE product_id = ?", [id]);
    run(db, "DELETE FROM products WHERE id = ?", [id]);
    return res.json({ ok: true });
  }

  res.status(405).end();
}
