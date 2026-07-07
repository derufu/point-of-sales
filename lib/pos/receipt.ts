import type { OrderRecord } from './types';
import { formatDateTime, formatPrice } from './format';

export function printReceipt(order: OrderRecord, storeName = 'CaféPOS') {
  const lines: string[] = [
    storeName,
    '─'.repeat(32),
    `Order #${order.orderNumber}`,
    formatDateTime(order.createdAt),
    order.customerName ? `Customer: ${order.customerName}` : '',
    '─'.repeat(32),
    ...order.items.map((item) => {
      const size = item.size ? ` (${item.size})` : '';
      const note = item.note ? ` [${item.note}]` : '';
      return `${item.qty}x ${item.name}${size}${note}\n   ${formatPrice(item.price * item.qty)}`;
    }),
    '─'.repeat(32),
    `Subtotal:     ${formatPrice(order.subtotal)}`,
    order.discountAmount > 0
      ? `Discount:    -${formatPrice(order.discountAmount)}`
      : '',
    `VAT (12%):    ${formatPrice(order.taxAmount)}`,
    `TOTAL:        ${formatPrice(order.total)}`,
    `Payment:      ${order.paymentMethod.toUpperCase()}`,
    order.promoCode ? `Promo:        ${order.promoCode}` : '',
    '─'.repeat(32),
    'Thank you for your order!',
    'Please come again ☕',
  ].filter(Boolean);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt #${order.orderNumber}</title>
      <style>
        body { font-family: 'Courier New', monospace; font-size: 12px; max-width: 280px; margin: 20px auto; }
        pre { white-space: pre-wrap; line-height: 1.5; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <pre>${lines.join('\n')}</pre>
      <script>window.onload = () => { window.print(); }</script>
    </body>
    </html>
  `;

  const win = window.open('', '_blank', 'width=320,height=600');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
