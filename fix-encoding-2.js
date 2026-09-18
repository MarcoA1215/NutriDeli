const fs = require('fs');
let file = fs.readFileSync('apps/frontend/src/pages/Orders.tsx', 'utf8');

file = file.replace(/header: '.*?Borrar Cancelados\?'/, "header: '¿Borrar Cancelados?'");
file = file.replace(/message: 'Esta acc.*?n eliminar.*? de forma permanente todos los pedidos cancelados del historial\. .*?Deseas.*?continuar\?'/, "message: 'Esta acción eliminará de forma permanente todos los pedidos cancelados del historial. ¿Deseas continuar?'");

fs.writeFileSync('apps/frontend/src/pages/Orders.tsx', file);
console.log("Fixed encoding with regex");
