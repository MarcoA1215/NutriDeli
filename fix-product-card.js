const fs = require('fs');
let file = fs.readFileSync('apps/frontend/src/components/products/ProductCard.tsx', 'utf8');

file = file.replace(/onAdjustStock: \(p: Product\) => void;/, "onAdjustStock?: (p: Product) => void;");

file = file.replace(/\{ text: 'Stock Inicial \/ Ajuste', icon: cubeOutline, cssClass: 'action-sheet-editar', handler: \(\) => onAdjustStock\(p\) \}/, `...(onAdjustStock ? [{ text: 'Stock Inicial / Ajuste', icon: cubeOutline, cssClass: 'action-sheet-editar', handler: () => onAdjustStock(p) }] : [])`);

fs.writeFileSync('apps/frontend/src/components/products/ProductCard.tsx', file);
console.log("Patched ProductCard.tsx");
