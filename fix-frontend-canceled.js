const fs = require('fs');
let file = fs.readFileSync('apps/frontend/src/pages/Orders.tsx', 'utf8');

const newMethod = `
  const handleClearCanceled = () => {
    presentAlert({
      header: '¿Borrar Cancelados?',
      message: 'Esta acción eliminará de forma permanente todos los pedidos cancelados del historial. ¿Deseas continuar?',
      buttons: [
        { text: 'No, cancelar', role: 'cancel' },
        { 
          text: 'Sí, Borrar', 
          role: 'destructive',
          handler: async () => {
            try {
              await apiClient.delete('/orders/canceled/all');
              presentToast({ message: 'Pedidos cancelados eliminados', duration: 2000, color: 'success' });
              fetchOrders();
            } catch (e) {
              presentToast({ message: 'Error eliminando pedidos', duration: 3000, color: 'danger' });
            }
          }
        }
      ]
    });
  };
`;

file = file.replace(/const updateStatus = async/, newMethod + "\n  const updateStatus = async");

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
file = file.replace(/<IonGrid>\s*<IonRow>/, newButton);

fs.writeFileSync('apps/frontend/src/pages/Orders.tsx', file);
console.log("Updated Orders.tsx with clear canceled button");
