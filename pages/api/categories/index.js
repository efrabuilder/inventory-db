// pages/api/categories/index.js
import { getDb, query } from "../../../lib/db";

export default async function handler(req, res) {
  const db = await getDb();
  res.json(query(db, "SELECT * FROM categories ORDER BY name"));
}
