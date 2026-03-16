// pages/api/movements/index.js
import { getMovements, addMovement } from "../../../lib/db";

export default function handler(req, res) {
  if (req.method === "GET") return res.json(getMovements());
  if (req.method === "POST") {
    const { product_id, type, quantity } = req.body;
    if (!product_id || !type || !quantity)
      return res.status(400).json({ error: "product_id, type and quantity required" });
    addMovement(req.body);
    return res.status(201).json({ ok: true });
  }
  res.status(405).end();
}
