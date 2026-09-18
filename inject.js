const fs = require('fs');
let file = fs.readFileSync('apps/frontend/src/pages/Orders.tsx', 'utf8');

const regex = /<IonGrid>[\r\n\s]*<IonRow>/;
const newButton = `
          <IonGrid>
            {tab === "historial" && (
              <IonRow>
                <IonCol size="12" className="ion-text-center">
                  <IonButton color="danger" fill="outline" onClick={handleClearCanceled}>
                    <IonIcon icon={trashOutline} slot="start" />
                    Borrar Cancelados
                  </IonButton>
                </IonCol>
              </IonRow>
            )}
            <IonRow>
`;

if(regex.test(file)) {
  file = file.replace(regex, newButton.trim());
  fs.writeFileSync('apps/frontend/src/pages/Orders.tsx', file);
  console.log("Button injected");
} else {
  console.log("Grid not found");
}
