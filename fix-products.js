const fs = require('fs');
let file = fs.readFileSync('apps/frontend/src/pages/Products.tsx', 'utf8');

// Add showAdjustStockButton state
file = file.replace(/const \[searchText, setSearchText\] = useState\(''\);/, "const [searchText, setSearchText] = useState('');\n  const [showAdjust, setShowAdjust] = useState(true);");

// Fetch settings
file = file.replace(/const res = await apiClient\.get<Product\[\]>\('\/products'\);\n\s*setProducts\(res\.data\);/, `const res = await apiClient.get<Product[]>('/products');
      setProducts(res.data);
      const s = await apiClient.get('/settings');
      setShowAdjust(s.data.showAdjustStockButton !== false);`);

// Modify openAdjustStockAlert message
file = file.replace(/header: 'Stock Inicial de ' \+ p\.name,/, `header: 'Stock Inicial de ' + p.name,
      message: '⚠️ ATENCIÓN: Este botón es únicamente para cargar inventario inicial. Si deseas fabricar un lote usando materia prima, ve a la pestaña Producción.',`);

// Hide the button conditionally
file = file.replace(/onAdjustStock=\{openAdjustStockAlert\}/, "onAdjustStock={showAdjust ? openAdjustStockAlert : undefined}");

fs.writeFileSync('apps/frontend/src/pages/Products.tsx', file);
console.log("Patched Products.tsx");
