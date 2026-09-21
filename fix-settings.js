const fs = require('fs');
let file = fs.readFileSync('apps/backend/src/entities/settings.entity.ts', 'utf8');

if (!file.includes('showAdjustStockButton')) {
  file = file.replace('}', `
  @Column('boolean', { default: true })
  showAdjustStockButton: boolean;
}`);
  fs.writeFileSync('apps/backend/src/entities/settings.entity.ts', file);
  console.log("Added showAdjustStockButton to settings.entity.ts");
}
