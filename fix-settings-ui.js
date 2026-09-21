const fs = require('fs');
let file = fs.readFileSync('apps/frontend/src/pages/Settings.tsx', 'utf8');

file = file.replace(/allowPartialPayments\?: boolean;/, "allowPartialPayments?: boolean;\n  showAdjustStockButton?: boolean;");

file = file.replace(/allowPartialPayments: settings\.allowPartialPayments/, "allowPartialPayments: settings.allowPartialPayments,\n          showAdjustStockButton: settings.showAdjustStockButton");

file = file.replace(/<IonToggle checked=\{settings\.allowPartialPayments \|\| false\} onIonChange=\{e => setSettings\(\{\.\.\.settings, allowPartialPayments: e\.detail\.checked\}\)\} \/>\n\s*<\/IonItem>/, `<IonToggle checked={settings.allowPartialPayments || false} onIonChange={e => setSettings({...settings, allowPartialPayments: e.detail.checked})} />
                  </IonItem>
                  <IonItem>
                    <IonLabel>Mostrar botón de "Añadir Stock Inicial"</IonLabel>
                    <IonToggle checked={settings.showAdjustStockButton !== false} onIonChange={e => setSettings({...settings, showAdjustStockButton: e.detail.checked})} />
                  </IonItem>`);

fs.writeFileSync('apps/frontend/src/pages/Settings.tsx', file);
console.log("Patched Settings.tsx");
