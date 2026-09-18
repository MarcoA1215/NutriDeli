const fs = require('fs');
let file = fs.readFileSync('apps/frontend/src/pages/Orders.tsx', 'utf8');

const replacement = `
  const handleCopyOrder = (order: any) => {
    let text = '*NutriDeli - Pedido ' + order.customerName + '*\n';
    if (order.customerPhone) text += 'Tel: ' + order.customerPhone + '\n';
    text += 'Tipo: ' + (order.deliveryMethod === DeliveryMethod.DELIVERY ? 'Delivery' : (order.deliveryMethod === DeliveryMethod.PICKUP ? 'Pickup' : 'Local')) + '\n';
    if (order.deliveryMethod === DeliveryMethod.DELIVERY && order.deliveryZone) {
      text += 'Zona: ' + order.deliveryZone.name + '\n';
    }
    if (order.customerAddress) text += 'Dir: ' + order.customerAddress + '\n';
    text += '-----------------------\n';
    order.items.forEach((item: any) => {
      const price = item.subtotal ? ' ($' + Number(item.subtotal || 0).toFixed(2) + ')' : '';
      text += '- ' + parseFloat(Number(item.quantity).toFixed(4)) + 'x ' + (item.productName || item.product?.name) + price + '\n';
    });
    text += '-----------------------\n';
    if (order.deliveryFee && order.deliveryFee > 0) {
      text += '*Costo Delivery: $' + order.deliveryFee.toFixed(2) + '*\n';
    }
    const abonosTotal = order.abonosTotal || 0;
    const remaining = order.totalAmount - abonosTotal;
    
    text += '*TOTAL: $' + order.totalAmount.toFixed(2) + ' (Bs. ' + (order.totalAmount * exchangeRate).toFixed(2) + ')*\n';
    
    if (abonosTotal > 0) {
      text += '*ABONOS: $' + abonosTotal.toFixed(2) + '*\n';
      text += '*RESTANTE: $' + remaining.toFixed(2) + ' (Bs. ' + (remaining * exchangeRate).toFixed(2) + ')*\n';
    }
    
    if (order.notes) text += '\nNotas: ' + order.notes + '\n';
    
    if (remaining > 0 && settings && settings.companyBank && settings.companyPhone && settings.companyCedula) {
      text += '\n*DATOS PAGO MÓVIL*\n';
      text += 'Banco: ' + settings.companyBank + '\n';
      text += 'Tlf: ' + settings.companyPhone + '\n';
      text += 'CI/RIF: ' + settings.companyCedula + '\n';
    }
    
    navigator.clipboard.writeText(text);
    presentToast({ message: 'Pedido copiado al portapapeles', duration: 2000, color: 'success' });
  };
`;

const regex = /const handleCopyOrder = \(order: any\) => \{[\s\S]*?presentToast\(\{ message: 'Pedido copiado al portapapeles', duration: 2000, color: 'success' \}\);\s*\};\s*/;

file = file.replace(regex, replacement.trim() + "\n\n  ");

fs.writeFileSync('apps/frontend/src/pages/Orders.tsx', file);
console.log("Updated handleCopyOrder");
