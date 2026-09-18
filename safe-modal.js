const fs = require('fs');
let file = fs.readFileSync('apps/frontend/src/pages/Orders.tsx', 'utf8');

// totalAmount
file = file.replace(/selectedOrderForDetails\.totalAmount\.toFixed\(2\)/g, "Number(selectedOrderForDetails.totalAmount || 0).toFixed(2)");

// items.map
file = file.replace(/\{selectedOrderForDetails\.items\.map/g, "{(selectedOrderForDetails.items || []).map");

// abono.amount
file = file.replace(/abono\.amount\.toFixed\(2\)/g, "Number(abono.amount || 0).toFixed(2)");

// item.subtotal
file = file.replace(/item\.subtotal\.toFixed\(2\)/g, "Number(item.subtotal || 0).toFixed(2)");

// Also safe guard the PaymentStatus includes
file = file.replace(/\[PaymentStatus\.PENDING, PaymentStatus\.PARTIAL\]\.includes\(selectedOrderForDetails\.paymentStatus\)/g, "[PaymentStatus.PENDING, PaymentStatus.PARTIAL].includes(selectedOrderForDetails?.paymentStatus)");

fs.writeFileSync('apps/frontend/src/pages/Orders.tsx', file);
console.log("Safeguarded Orders.tsx modal");
