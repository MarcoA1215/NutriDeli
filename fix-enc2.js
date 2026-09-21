const fs = require('fs');
let file = fs.readFileSync('apps/frontend/src/pages/Settings.tsx', 'utf8');
file = file.replace(/<IonLabel>Mostrar bot.*?n de "A.*?adir Stock Inicial"<\/IonLabel>/, '<IonLabel>Mostrar botón de "Añadir Stock Inicial"</IonLabel>');
fs.writeFileSync('apps/frontend/src/pages/Settings.tsx', file);
