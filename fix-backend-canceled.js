const fs = require('fs');
let file = fs.readFileSync('apps/backend/src/orders/orders.service.ts', 'utf8');

const newMethod = `
  async deleteAllCanceled() {
    const orderRepo = this.dataSource.getRepository(Order);
    const result = await orderRepo.delete({ status: OrderStatus.CANCELED });
    return { deletedCount: result.affected };
  }
`;

file = file.replace(/async updatePaymentStatus[\s\S]*?\{/, newMethod + "\n  async updatePaymentStatus(id: string, dto: UpdatePaymentDto) {");
fs.writeFileSync('apps/backend/src/orders/orders.service.ts', file);
console.log("Updated orders.service.ts");

let controller = fs.readFileSync('apps/backend/src/orders/orders.controller.ts', 'utf8');
const newEndpoint = `
  @Delete('canceled/all')
  deleteAllCanceled() {
    return this.ordersService.deleteAllCanceled();
  }
`;
controller = controller.replace(/@Delete\(':id\/abono\/:index'\)/, newEndpoint + "\n\n  @Delete(':id/abono/:index')");
fs.writeFileSync('apps/backend/src/orders/orders.controller.ts', controller);
console.log("Updated orders.controller.ts");
