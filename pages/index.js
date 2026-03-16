// pages/index.js
import { useState, useEffect, useCallback } from "react";

const AMBER  = "rgba(245,158,11,";
const GREEN  = "rgba(16,185,129,";
const RED    = "rgba(239,68,68,";
const BLUE   = "rgba(59,130,246,";
const ORANGE = "rgba(255,107,53,";

function Badge({ stock, min }) {
  const low = stock <= min;
  const out = stock === 0;
  if (out)  return <span className="px-2 py-0.5 rounded text-xs font-bold" style={{background:RED+"0.15)",color:"#f87171",border:`1px solid ${RED}0.3)`}}>Out of stock</span>;
  if (low)  return <span className="px-2 py-0.5 rounded text-xs font-bold" style={{background:AMBER+"0.15)",color:"#fbbf24",border:`1px solid ${AMBER}0.3)`}}>Low stock</span>;
  return <span className="px-2 py-0.5 rounded text-xs font-bold" style={{background:GREEN+"0.15)",color:"#34d399",border:`1px solid ${GREEN}0.3)`}}>In stock</span>;
}

export default function Home() {
  const [tab, setTab]             = useState("inventory");
  const [products, setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [movements, setMovements] = useState([]);
  const [report, setReport]       = useState(null);
  const [filters, setFilters]     = useState({ category: "all", search: "", low_stock: false });
  const [selected, setSelected]   = useState(null);
  const [showNew, setShowNew]     = useState(false);
  const [showMove, setShowMove]   = useState(null);
  const [newProduct, setNewProduct] = useState({ name:"", sku:"", description:"", category_id:"", price:0, stock:0, min_stock:5, unit:"unit" });
  const [moveForm, setMoveForm]   = useState({ type:"in", quantity:1, reason:"" });

  const fetchProducts = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.category !== "all") params.set("category", filters.category);
    if (filters.search) params.set("search", filters.search);
    if (filters.low_stock) params.set("low_stock", "true");
    const r = await fetch("/api/products?" + params);
    setProducts(await r.json());
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetch("/api/categories").then(r=>r.json()).then(setCategories); }, []);
  useEffect(() => {
    if (tab === "movements") fetch("/api/movements").then(r=>r.json()).then(setMovements);
    if (tab === "report") fetch("/api/report").then(r=>r.json()).then(setReport);
  }, [tab]);

  async function createProduct(e) {
    e.preventDefault();
    await fetch("/api/products", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(newProduct) });
    setShowNew(false);
    setNewProduct({ name:"", sku:"", description:"", category_id:"", price:0, stock:0, min_stock:5, unit:"unit" });
    fetchProducts();
  }

  async function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method:"DELETE" });
    setSelected(null);
    fetchProducts();
  }

  async function addMovement(e) {
    e.preventDefault();
    await fetch("/api/movements", { method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ product_id: showMove.id, ...moveForm }) });
    setShowMove(null);
    setMoveForm({ type:"in", quantity:1, reason:"" });
    fetchProducts();
    if (tab === "movements") fetch("/api/movements").then(r=>r.json()).then(setMovements);
  }

  const lowCount = products.filter(p => p.stock <= p.min_stock).length;

  return (
    <div style={{minHeight:"100vh",background:"#0d0d0d",color:"#f0eee8",fontFamily:"'Inter',sans-serif"}}>
      {/* NAV */}
      <nav style={{position:"sticky",top:0,zIndex:50,background:"rgba(13,13,13,0.9)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontWeight:800,fontSize:20,letterSpacing:-1}}>inventory<span style={{color:"#FF6B35"}}>.</span>sys</span>
        <div style={{display:"flex",gap:8}}>
          {["inventory","movements","report"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{padding:"6px 16px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:500,
                background: tab===t ? "#FF6B35" : "rgba(255,255,255,0.06)",
                color: tab===t ? "#fff" : "#888",transition:"all .2s"}}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
          <button onClick={() => setShowNew(true)}
            style={{padding:"6px 16px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,background:"#FF6B35",color:"#fff"}}>
            + Add Product
          </button>
        </div>
      </nav>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 16px"}}>

        {/* INVENTORY TAB */}
        {tab === "inventory" && (
          <>
            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:24}}>
              {[
                {label:"Total Products", val:products.length, color:"#FF6B35"},
                {label:"Low Stock",      val:lowCount,        color:"#fbbf24"},
                {label:"Categories",     val:categories.length, color:"#a78bfa"},
                {label:"Out of Stock",   val:products.filter(p=>p.stock===0).length, color:"#f87171"},
              ].map(s => (
                <div key={s.label} style={{background:"#141414",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"16px 20px"}}>
                  <p style={{fontSize:12,color:"#888",marginBottom:6}}>{s.label}</p>
                  <p style={{fontSize:28,fontWeight:800,color:s.color}}>{s.val}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
              <input placeholder="Search by name or SKU..." value={filters.search}
                onChange={e => setFilters(f=>({...f,search:e.target.value}))}
                style={{flex:1,minWidth:200,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"8px 14px",color:"#f0eee8",fontSize:14,outline:"none"}} />
              <select value={filters.category} onChange={e => setFilters(f=>({...f,category:e.target.value}))}
                style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"8px 14px",color:"#f0eee8",fontSize:14,outline:"none"}}>
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:"#888",cursor:"pointer"}}>
                <input type="checkbox" checked={filters.low_stock} onChange={e => setFilters(f=>({...f,low_stock:e.target.checked}))} />
                Low stock only
              </label>
            </div>

            {/* Table */}
            <div style={{background:"#141414",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"rgba(255,107,53,0.1)"}}>
                    {["SKU","Name","Category","Price","Stock","Min","Status","Actions"].map(h => (
                      <th key={h} style={{padding:"12px 14px",textAlign:"left",fontSize:12,fontWeight:600,color:"#FF6B35",letterSpacing:1,textTransform:"uppercase"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p,i) => (
                    <tr key={p.id} style={{borderTop:"1px solid rgba(255,255,255,0.05)",background:i%2===0?"transparent":"rgba(255,255,255,0.02)"}}>
                      <td style={{padding:"10px 14px",fontSize:12,color:"#888",fontFamily:"monospace"}}>{p.sku}</td>
                      <td style={{padding:"10px 14px",fontSize:14,fontWeight:500,cursor:"pointer",color:"#f0eee8"}} onClick={()=>setSelected(p)}>{p.name}</td>
                      <td style={{padding:"10px 14px",fontSize:13,color:"#888"}}>{p.category_name||"—"}</td>
                      <td style={{padding:"10px 14px",fontSize:13,color:"#34d399"}}>${Number(p.price).toFixed(2)}</td>
                      <td style={{padding:"10px 14px",fontSize:14,fontWeight:700,color:p.stock===0?"#f87171":p.stock<=p.min_stock?"#fbbf24":"#f0eee8"}}>{p.stock}</td>
                      <td style={{padding:"10px 14px",fontSize:13,color:"#888"}}>{p.min_stock}</td>
                      <td style={{padding:"10px 14px"}}><Badge stock={p.stock} min={p.min_stock}/></td>
                      <td style={{padding:"10px 14px"}}>
                        <div style={{display:"flex",gap:6}}>
                          <button onClick={()=>setShowMove(p)} style={{padding:"4px 10px",borderRadius:6,border:"none",cursor:"pointer",fontSize:12,background:"rgba(59,130,246,0.15)",color:"#60a5fa"}}>Stock</button>
                          <button onClick={()=>deleteProduct(p.id)} style={{padding:"4px 10px",borderRadius:6,border:"none",cursor:"pointer",fontSize:12,background:"rgba(239,68,68,0.15)",color:"#f87171"}}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && <p style={{textAlign:"center",color:"#888",padding:40}}>No products found.</p>}
            </div>
          </>
        )}

        {/* MOVEMENTS TAB */}
        {tab === "movements" && (
          <div style={{background:"#141414",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,overflow:"hidden"}}>
            <div style={{padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
              <h2 style={{fontWeight:700,fontSize:18}}>Stock Movements</h2>
              <p style={{fontSize:13,color:"#888",marginTop:4}}>Last 50 movements</p>
            </div>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:"rgba(255,107,53,0.1)"}}>
                  {["Product","SKU","Type","Quantity","Reason","Date"].map(h => (
                    <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:12,fontWeight:600,color:"#FF6B35",letterSpacing:1,textTransform:"uppercase"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movements.map((m,i) => (
                  <tr key={m.id} style={{borderTop:"1px solid rgba(255,255,255,0.05)",background:i%2===0?"transparent":"rgba(255,255,255,0.02)"}}>
                    <td style={{padding:"10px 14px",fontSize:14,fontWeight:500}}>{m.product_name}</td>
                    <td style={{padding:"10px 14px",fontSize:12,color:"#888",fontFamily:"monospace"}}>{m.sku}</td>
                    <td style={{padding:"10px 14px"}}>
                      <span style={{padding:"2px 10px",borderRadius:6,fontSize:12,fontWeight:600,
                        background:m.type==="in"?GREEN+"0.15)":m.type==="out"?RED+"0.15)":AMBER+"0.15)",
                        color:m.type==="in"?"#34d399":m.type==="out"?"#f87171":"#fbbf24"}}>
                        {m.type.toUpperCase()}
                      </span>
                    </td>
                    <td style={{padding:"10px 14px",fontSize:14,fontWeight:700}}>{m.quantity}</td>
                    <td style={{padding:"10px 14px",fontSize:13,color:"#888"}}>{m.reason||"—"}</td>
                    <td style={{padding:"10px 14px",fontSize:12,color:"#888"}}>{m.created_at?.slice(0,16)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {movements.length === 0 && <p style={{textAlign:"center",color:"#888",padding:40}}>No movements yet.</p>}
          </div>
        )}

        {/* REPORT TAB */}
        {tab === "report" && report && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
              {[
                {label:"Total Products",  val:report.total_products,                         color:"#FF6B35"},
                {label:"Total Value",     val:`$${Number(report.total_value).toFixed(2)}`,   color:"#34d399"},
                {label:"Low Stock Items", val:report.low_stock.length,                        color:"#fbbf24"},
              ].map(s => (
                <div key={s.label} style={{background:"#141414",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"20px 24px"}}>
                  <p style={{fontSize:12,color:"#888",marginBottom:6}}>{s.label}</p>
                  <p style={{fontSize:28,fontWeight:800,color:s.color}}>{s.val}</p>
                </div>
              ))}
            </div>

            {report.low_stock.length > 0 && (
              <div style={{background:"rgba(245,158,11,0.05)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:12,padding:"20px 24px"}}>
                <h3 style={{color:"#fbbf24",fontWeight:700,marginBottom:12}}>⚠ Low Stock Alerts ({report.low_stock.length})</h3>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {report.low_stock.map(p => (
                    <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"10px 14px"}}>
                      <div>
                        <span style={{fontWeight:600,fontSize:14}}>{p.name}</span>
                        <span style={{fontSize:12,color:"#888",marginLeft:10}}>{p.sku}</span>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <span style={{color:"#fbbf24",fontWeight:700}}>{p.stock} left</span>
                        <span style={{color:"#888",fontSize:12,marginLeft:6}}>(min: {p.min_stock})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* NEW PRODUCT MODAL */}
      {showNew && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setShowNew(false)}>
          <div style={{background:"#141414",border:"1px solid rgba(255,255,255,0.12)",borderRadius:16,padding:24,width:"100%",maxWidth:480}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
              <h2 style={{fontWeight:700,fontSize:18}}>New Product</h2>
              <button onClick={()=>setShowNew(false)} style={{background:"none",border:"none",color:"#888",cursor:"pointer",fontSize:20}}>✕</button>
            </div>
            <form onSubmit={createProduct} style={{display:"flex",flexDirection:"column",gap:10}}>
              {[["name","Name *"],["sku","SKU *"],["description","Description"],["unit","Unit"]].map(([field,label]) => (
                <input key={field} required={field==="name"||field==="sku"} placeholder={label} value={newProduct[field]}
                  onChange={e=>setNewProduct(p=>({...p,[field]:e.target.value}))}
                  style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"8px 12px",color:"#f0eee8",fontSize:14,outline:"none"}} />
              ))}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {[["price","Price",0],["stock","Stock",0],["min_stock","Min Stock",5]].map(([field,label,def]) => (
                  <input key={field} type="number" min={0} placeholder={label} value={newProduct[field]}
                    onChange={e=>setNewProduct(p=>({...p,[field]:Number(e.target.value)}))}
                    style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"8px 12px",color:"#f0eee8",fontSize:14,outline:"none"}} />
                ))}
              </div>
              <select value={newProduct.category_id} onChange={e=>setNewProduct(p=>({...p,category_id:e.target.value}))}
                style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"8px 12px",color:"#f0eee8",fontSize:14,outline:"none"}}>
                <option value="">Select category</option>
                {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button type="submit" style={{background:"#FF6B35",color:"#fff",border:"none",borderRadius:8,padding:"10px",fontWeight:600,cursor:"pointer",fontSize:14}}>Create Product</button>
            </form>
          </div>
        </div>
      )}

      {/* STOCK MOVEMENT MODAL */}
      {showMove && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setShowMove(null)}>
          <div style={{background:"#141414",border:"1px solid rgba(255,255,255,0.12)",borderRadius:16,padding:24,width:"100%",maxWidth:400}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <h2 style={{fontWeight:700,fontSize:18}}>Stock Movement</h2>
              <button onClick={()=>setShowMove(null)} style={{background:"none",border:"none",color:"#888",cursor:"pointer",fontSize:20}}>✕</button>
            </div>
            <p style={{fontSize:13,color:"#888",marginBottom:16}}>{showMove.name} — Current stock: <strong style={{color:"#f0eee8"}}>{showMove.stock}</strong></p>
            <form onSubmit={addMovement} style={{display:"flex",flexDirection:"column",gap:10}}>
              <select value={moveForm.type} onChange={e=>setMoveForm(f=>({...f,type:e.target.value}))}
                style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"8px 12px",color:"#f0eee8",fontSize:14,outline:"none"}}>
                <option value="in">Stock In (+)</option>
                <option value="out">Stock Out (-)</option>
                <option value="adjustment">Adjustment (set to)</option>
              </select>
              <input type="number" min={1} required placeholder="Quantity" value={moveForm.quantity}
                onChange={e=>setMoveForm(f=>({...f,quantity:Number(e.target.value)}))}
                style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"8px 12px",color:"#f0eee8",fontSize:14,outline:"none"}} />
              <input placeholder="Reason (optional)" value={moveForm.reason}
                onChange={e=>setMoveForm(f=>({...f,reason:e.target.value}))}
                style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"8px 12px",color:"#f0eee8",fontSize:14,outline:"none"}} />
              <button type="submit" style={{background:"#FF6B35",color:"#fff",border:"none",borderRadius:8,padding:"10px",fontWeight:600,cursor:"pointer",fontSize:14}}>Apply Movement</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
