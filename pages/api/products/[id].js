// pages/api/products/[id].js
import { getProductById, updateProduct, deleteProduct } from "../../../lib/db";

export default function handler(req, res) {
  const { id } = req.query;
  if (req.method === "GET") {
    const p = getProductById(id);
    if (!p) return res.status(404).json({ error: "Not found" });
    return res.json(p);
  }
  if (req.method === "PATCH") {
    updateProduct(id, req.body);
    return res.json({ ok: true });
  }
  if (req.method === "DELETE") {
    deleteProduct(id);
    return res.json({ ok: true });
  }
  res.status(405).end();
}
