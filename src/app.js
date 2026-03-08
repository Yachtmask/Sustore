// app.js — sustore main server
// AI-powered digital product marketplace on Shelby storage

require(“dotenv”).config();
const express = require(“express”);
const cors = require(“cors”);
const path = require(“path”);
const multer = require(“multer”);

const {
getAllProducts,
getProduct,
searchProducts,
listNewProduct,
purchaseProduct,
} = require(”./marketplace”);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, “../public”)));

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET all products
app.get(”/api/products”, (req, res) => {
const { category } = req.query;
res.json({ success: true, products: getAllProducts(category) });
});

// GET single product
app.get(”/api/products/:id”, (req, res) => {
const product = getProduct(req.params.id);
if (!product) return res.status(404).json({ error: “Product not found” });
res.json({ success: true, product });
});

// GET search products (AI-powered via Shelby MCP — basic for now)
app.get(”/api/search”, (req, res) => {
const { q } = req.query;
if (!q) return res.status(400).json({ error: “Query required” });
const results = searchProducts(q);
res.json({ success: true, results, count: results.length });
});

// POST list a new product (creator uploads file to Shelby)
app.post(”/api/products”, upload.single(“file”), async (req, res) => {
try {
const { name, description, category, price, creator } = req.body;
if (!req.file) return res.status(400).json({ error: “File required” });

```
const product = await listNewProduct(req.file.buffer, req.file.originalname, {
  name,
  description,
  category,
  price: parseFloat(price),
  creator,
});

res.status(201).json({ success: true, product });
```

} catch (err) {
res.status(500).json({ error: err.message });
}
});

// POST purchase a product
app.post(”/api/products/:id/purchase”, async (req, res) => {
try {
const { buyerAddress } = req.body;
const receipt = await purchaseProduct(req.params.id, buyerAddress);
res.json({ success: true, receipt });
} catch (err) {
res.status(500).json({ error: err.message });
}
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`🛍️  sustore running at http://localhost:${PORT}`);
console.log(`📦  Shelby storage bucket: ${process.env.SHELBY_BUCKET || "sustore-products"}`);
});
