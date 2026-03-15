// pages/api/movements/index.js
import { getDb, query, run } from "../../../lib/db";

export default async function handler(req, res) {
  const db = await getDb();

  if (req.method === "GET") {
    const rows = query(db, `
      SELECT m.*, p.name AS product_name, p.sku
      FROM stock_movements m
      JOIN products p ON m.product_id = p.id
      ORDER BY m.created_at DESC LIMIT 50`);
    return res.json(rows);
  }

  if (req.method === "POST") {
    const { product_id, type, quantity, reason } = req.body;
    if (!product_id || !type || !quantity)
      return res.status(400).json({ error: "product_id, type and quantity required" });
    run(db, "INSERT INTO stock_movements(product_id,type,quantity,reason) VALUES(?,?,?,?)",
      [product_id, type, quantity, reason || ""]);
    return res.status(201).json({ ok: true });
  }

  res.status(405).end();
}
