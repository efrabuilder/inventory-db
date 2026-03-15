# 🗄️ Inventory DB System

Relational database system for warehouse management with SQL triggers, stored procedures and a React web interface.

Built by **Efraín Rojas Artavia**

---

## Features

- ✅ Full product **CRUD** (create, read, update, delete)
- ✅ **Stock control** — in, out and adjustment movements
- ✅ **SQL triggers** that auto-update stock on every movement
- ✅ **Low stock alerts** with configurable minimums
- ✅ **Inventory report** with total value calculation
- ✅ **Search and filter** by category, name or SKU
- ✅ React web interface with dark theme

## Quick Start

```bash
git clone https://github.com/efrabuilder/inventory-db.git
cd inventory-db
npm install
npm run db:init
npm run dev
```

Open http://localhost:3000

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Next.js |
| Database | SQLite with triggers |
| Backend | Next.js API Routes |
| ORM | sql.js (no compilation needed) |

## License
MIT
