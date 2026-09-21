const fs = require('fs');
let file = fs.readFileSync('apps/backend/src/production/production.service.ts', 'utf8');

// Fix createBatch
file = file.replace(/await this\.ordersService\.autoAllocatePhysicalStock\(\);\s*return \{\s*product: updatedProduct,\s*batch\s*\};\s*\}\);/m, `return { product: updatedProduct, batch };
    });
    
    // Ejecutar fuera de la transaccion principal para evitar deadlocks en SQLite
    await this.ordersService.autoAllocatePhysicalStock().catch(e => console.error('Error auto-allocating stock', e));
    return result;`);

file = file.replace(/return this\.dataSource\.transaction\(async \(manager\) => \{/, "const result = await this.dataSource.transaction(async (manager) => {");


// Fix revertBatch
file = file.replace(/await this\.ordersService\.autoAllocatePhysicalStock\(\);\s*return \{ success: true, message: 'Lote revertido correctamente' \};\s*\}\);/m, `return { success: true, message: 'Lote revertido correctamente' };
    });

    await this.ordersService.autoAllocatePhysicalStock().catch(e => console.error('Error auto-allocating stock', e));
    return result;`);

fs.writeFileSync('apps/backend/src/production/production.service.ts', file);
console.log("Patched production.service.ts");

let prodService = fs.readFileSync('apps/backend/src/products/products.service.ts', 'utf8');
prodService = prodService.replace(/product\.stockQuantity \+= quantity;/, "product.stockQuantity += quantity;\n    product.physicalStock += quantity;");
fs.writeFileSync('apps/backend/src/products/products.service.ts', prodService);
console.log("Patched products.service.ts");
