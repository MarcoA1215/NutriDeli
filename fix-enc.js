const fs = require('fs');
let file = fs.readFileSync('apps/frontend/src/pages/Settings.tsx', 'utf8');
file = file.replace(/botn/, 'botón');
file = file.replace(/Aadir/, 'Añadir');
fs.writeFileSync('apps/frontend/src/pages/Settings.tsx', file);
