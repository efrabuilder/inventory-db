// pages/api/products/index.js
import { getProducts, createProduct } from "../../../lib/db";

export default function handler(req, res) {
  if (req.method === "GET") return res.json(getProducts(req.query));
  if (req.method === "POST") {
    const { name, sku } = req.body;
    if (!name || !sku) return res.status(400).json({ error: "Name and SKU required" });
    return res.status(201).json(createProduct(req.body));
  }
  res.status(405).end();
}
