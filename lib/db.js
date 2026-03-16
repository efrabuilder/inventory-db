// lib/db.js — in-memory store, no sql.js, Vercel compatible

const store = {
  categories: [
    { id: 1, name: "Electronics" },
    { id: 2, name: "Office Supplies" },
    { id: 3, name: "Networking" },
    { id: 4, name: "Software" },
    { id: 5, name: "Hardware" },
  ],
  products: [
    { id: 1,  name: "Laptop Dell Latitude 5540", sku: "LAP-001", description: "Business laptop 15\"", category_id: 1, price: 850.00, stock: 12, min_stock: 3,  unit: "unit" },
    { id: 2,  name: "Wireless Mouse Logitech",   sku: "MOU-001", description: "Ergonomic wireless mouse", category_id: 1, price: 25.00,  stock: 45, min_stock: 10, unit: "unit" },
    { id: 3,  name: "USB-C Hub 7-port",          sku: "HUB-001", description: "7-port USB-C hub",    category_id: 1, price: 35.00,  stock: 3,  min_stock: 5,  unit: "unit" },
    { id: 4,  name: "A4 Paper 500 sheets",       sku: "PAP-001", description: "Office paper ream",   category_id: 2, price: 8.50,   stock: 80, min_stock: 20, unit: "ream" },
    { id: 5,  name: "Stapler Heavy Duty",        sku: "STA-001", description: "Heavy duty stapler",  category_id: 2, price: 15.00,  stock: 8,  min_stock: 3,  unit: "unit" },
    { id: 6,  name: "Cat6 Cable 10m",            sku: "CAB-001", description: "Ethernet Cat6 cable", category_id: 3, price: 12.00,  stock: 25, min_stock: 10, unit: "unit" },
    { id: 7,  name: "Network Switch 24p",        sku: "SWT-001", description: "24-port managed switch", category_id: 3, price: 320.00, stock: 2, min_stock: 2, unit: "unit" },
    { id: 8,  name: "Patch Panel 24p",           sku: "PAT-001", description: "24-port patch panel", category_id: 3, price: 85.00,  stock: 4,  min_stock: 2,  unit: "unit" },
    { id: 9,  name: "Antivirus License",         sku: "ANT-001", description: "Annual license",      category_id: 4, price: 45.00,  stock: 15, min_stock: 5,  unit: "license" },
    { id: 10, name: "Office 365 Business",       sku: "OFF-001", description: "Annual subscription", category_id: 4, price: 120.00, stock: 20, min_stock: 5,  unit: "license" },
    { id: 11, name: "RAM DDR4 16GB",             sku: "RAM-001", description: "16GB DDR4 3200MHz",   category_id: 5, price: 55.00,  stock: 2,  min_stock: 5,  unit: "unit" },
    { id: 12, name: "SSD 500GB",                 sku: "SSD-001", description: "NVMe SSD 500GB",      category_id: 5, price: 65.00,  stock: 6,  min_stock: 3,  unit: "unit" },
  ],
  movements: [
    { id: 1, product_id: 1, type: "in",  quantity: 10, reason: "Initial stock",      created_at: "2026-03-01 08:00:00" },
    { id: 2, product_id: 3, type: "out", quantity: 2,  reason: "Sold to client",     created_at: "2026-03-02 09:00:00" },
    { id: 3, product_id: 7, type: "in",  quantity: 3,  reason: "Purchase order #42", created_at: "2026-03-03 10:00:00" },
    { id: 4, product_id: 11,type: "out", quantity: 3,  reason: "IT department",      created_at: "2026-03-04 11:00:00" },
    { id: 5, product_id: 4, type: "in",  quantity: 50, reason: "Bulk purchase",      created_at: "2026-03-05 12:00:00" },
  ],
  nextProductId: 13,
  nextMovementId: 6,
};

// ── Categories ────────────────────────────────────────────────────────────────
export function getCategories() {
  return [...store.categories];
}

// ── Products ──────────────────────────────────────────────────────────────────
function attachCategory(product) {
  const cat = store.categories.find(c => c.id === product.category_id);
  return { ...product, category_name: cat ? cat.name : null };
}

export function getProducts({ category, search, low_stock } = {}) {
  let list = [...store.products];
  if (category && category !== "all") list = list.filter(p => p.category_id === Number(category));
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }
  if (low_stock === "true") list = list.filter(p => p.stock <= p.min_stock);
  return list.sort((a, b) => a.name.localeCompare(b.name)).map(attachCategory);
}

export function getProductById(id) {
  const p = store.products.find(p => p.id === Number(id));
  if (!p) return null;
  const movements = store.movements.filter(m => m.product_id === Number(id))
    .sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 20);
  return { ...attachCategory(p), movements };
}

export function createProduct({ name, sku, description, category_id, price, stock, min_stock, unit }) {
  const product = {
    id: store.nextProductId++,
    name, sku, description: description || "",
    category_id: category_id ? Number(category_id) : null,
    price: Number(price) || 0,
    stock: Number(stock) || 0,
    min_stock: Number(min_stock) || 5,
    unit: unit || "unit",
  };
  store.products.push(product);
  return product;
}

export function updateProduct(id, patch) {
  const idx = store.products.findIndex(p => p.id === Number(id));
  if (idx === -1) return false;
  store.products[idx] = { ...store.products[idx], ...patch };
  return true;
}

export function deleteProduct(id) {
  const idx = store.products.findIndex(p => p.id === Number(id));
  if (idx === -1) return false;
  store.movements = store.movements.filter(m => m.product_id !== Number(id));
  store.products.splice(idx, 1);
  return true;
}

// ── Movements ─────────────────────────────────────────────────────────────────
export function getMovements() {
  return store.movements
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 50)
    .map(m => {
      const p = store.products.find(p => p.id === m.product_id);
      return { ...m, product_name: p ? p.name : "Deleted", sku: p ? p.sku : "" };
    });
}

export function addMovement({ product_id, type, quantity, reason }) {
  const idx = store.products.findIndex(p => p.id === Number(product_id));
  if (idx === -1) return false;
  const qty = Number(quantity);
  if (type === "in")         store.products[idx].stock += qty;
  else if (type === "out")   store.products[idx].stock = Math.max(0, store.products[idx].stock - qty);
  else if (type === "adjustment") store.products[idx].stock = qty;

  store.movements.push({
    id: store.nextMovementId++,
    product_id: Number(product_id),
    type, quantity: qty,
    reason: reason || "",
    created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
  });
  return true;
}

// ── Report ────────────────────────────────────────────────────────────────────
export function getReport() {
  const products = store.products.map(attachCategory);
  const low_stock = products.filter(p => p.stock <= p.min_stock);
  const total_value = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const movements = getMovements();
  return { products, low_stock, total_value, movements, total_products: products.length };
}
