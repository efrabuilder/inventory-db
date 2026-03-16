// pages/api/categories/index.js
import { getCategories } from "../../../lib/db";
export default function handler(req, res) {
  res.json(getCategories());
}
