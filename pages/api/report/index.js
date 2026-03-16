// pages/api/report/index.js
import { getReport } from "../../../lib/db";
export default function handler(req, res) {
  res.json(getReport());
}
