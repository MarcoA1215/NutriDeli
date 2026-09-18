const fs = require('fs');
let file = fs.readFileSync('apps/frontend/src/pages/Orders.tsx', 'utf8');

// 1. Add Imports
file = file.replace(
  "import { IonButtons",
  "import { IonSelect, IonSelectOption, IonButtons"
);

// 2. Add handleClearCanceled before updateStatus
file = file.replace(
  "  const updateStatus = async",
`  const handleClearCanceled = () => {
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

  const updateStatus = async`
);

// 3. Add Button in UI (find <IonGrid> and the first <IonRow>)
file = file.replace(
  "<IonGrid>\n          <IonRow>",
`<IonGrid>
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
          <IonRow>`
);

// 4. Update handleCopyOrder
const newCopy = `  const handleCopyOrder = (order: any) => {
    let text = '*NutriDeli - Pedido ' + order.customerName + '*\\n';
    if (order.customerPhone) text += 'Tel: ' + order.customerPhone + '\\n';
    text += 'Tipo: ' + (order.deliveryMethod === DeliveryMethod.DELIVERY ? 'Delivery' : (order.deliveryMethod === DeliveryMethod.PICKUP ? 'Pickup' : 'Local')) + '\\n';
    if (order.deliveryMethod === DeliveryMethod.DELIVERY && order.deliveryZone) {
      text += 'Zona: ' + order.deliveryZone.name + '\\n';
    }
    if (order.customerAddress) text += 'Dir: ' + order.customerAddress + '\\n';
    text += '-----------------------\\n';
    order.items.forEach((item: any) => {
      const price = item.subtotal ? ' ($' + Number(item.subtotal || 0).toFixed(2) + ')' : '';
      text += '- ' + parseFloat(Number(item.quantity).toFixed(4)) + 'x ' + (item.productName || item.product?.name) + price + '\\n';
    });
    text += '-----------------------\\n';
    if (order.deliveryFee && order.deliveryFee > 0) {
      text += '*Costo Delivery: $' + order.deliveryFee.toFixed(2) + '*\\n';
    }
    const abonosTotal = order.abonosTotal || 0;
    const remaining = order.totalAmount - abonosTotal;
    
    text += '*TOTAL: $' + order.totalAmount.toFixed(2) + ' (Bs. ' + (order.totalAmount * exchangeRate).toFixed(2) + ')*\\n';
    
    if (abonosTotal > 0) {
      text += '*ABONOS: $' + abonosTotal.toFixed(2) + '*\\n';
      text += '*RESTANTE: $' + remaining.toFixed(2) + ' (Bs. ' + (remaining * exchangeRate).toFixed(2) + ')*\\n';
    }
    if (order.notes) text += '\\nNotas: ' + order.notes + '\\n';
    
    if (remaining > 0 && settings && settings.companyBank && settings.companyPhone && settings.companyCedula) {
      text += '\\n*DATOS PAGO MÓVIL*\\n';
      text += 'Banco: ' + settings.companyBank + '\\n';
      text += 'Tlf: ' + settings.companyPhone + '\\n';
      text += 'CI/RIF: ' + settings.companyCedula + '\\n';
    }
    
    navigator.clipboard.writeText(text);
    presentToast({ message: 'Pedido copiado al portapapeles', duration: 2000, color: 'success' });
  };`;

// Use simple string replacement for handleCopyOrder by finding the start and end precisely.
const startIdx = file.indexOf("const handleCopyOrder = (order: any) => {");
const endIdx = file.indexOf("const fetchSettings =", startIdx);
file = file.substring(0, startIdx) + newCopy + "\n\n  " + file.substring(endIdx);

fs.writeFileSync('apps/frontend/src/pages/Orders.tsx', file);
console.log("Super safe patching completed.");
