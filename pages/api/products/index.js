// pages/api/products/index.js
import { getDb, query, run } from "../../../lib/db";

export default async function handler(req, res) {
  const db = await getDb();

  if (req.method === "GET") {
    const { category, search, low_stock } = req.query;
    let sql = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    if (category && category !== "all") { sql += " AND p.category_id = ?"; params.push(category); }
    if (search) { sql += " AND (p.name LIKE ? OR p.sku LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
    if (low_stock === "true") sql += " AND p.stock <= p.min_stock";
    sql += " ORDER BY p.name";
    return res.json(query(db, sql, params));
  }

  if (req.method === "POST") {
    const { name, sku, description, category_id, price, stock, min_stock, unit } = req.body;
    if (!name || !sku) return res.status(400).json({ error: "Name and SKU required" });
    run(db, `INSERT INTO products(name,sku,description,category_id,price,stock,min_stock,unit)
             VALUES(?,?,?,?,?,?,?,?)`,
      [name, sku, description || "", category_id || null, price || 0, stock || 0, min_stock || 5, unit || "unit"]);
    return res.status(201).json({ ok: true });
  }

  res.status(405).end();
}
