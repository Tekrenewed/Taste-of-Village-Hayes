import { FaloodaTelemetry } from '../../lib/telemetry';
import { Order } from '../../types';
import { SHOP_CONFIG } from '../../shopConfig';

export interface PrinterConfig {
  ip: string;
  protocol: 'http' | 'https';
}

export const printTicket = async (order: any, config?: PrinterConfig): Promise<void> => {
  FaloodaTelemetry.track('pos_print_started', { orderId: order.id, type: 'cloud_poll' });
  try {
    const isDev = import.meta.env.DEV;
    const apiBase = isDev ? (import.meta.env.VITE_API_URL || 'http://localhost:8080') : '';
    
    // Attempt REST API first
    let apiSuccess = false;
    try {
      const res = await fetch(`${apiBase}/api/v1/orders/${order.id}/reprint`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        apiSuccess = true;
      }
    } catch (apiErr) {
      console.warn('REST API reprint failed, falling back to Firestore', apiErr);
    }

    if (!apiSuccess) {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../../firebaseConfig');
      const docRef = doc(db, 'orders', order.id);
      await updateDoc(docRef, { needsPrinting: true, printed: false, printStatus: 'QUEUED_REPRINT' });
    }
    
    FaloodaTelemetry.track('pos_print_success', { orderId: order.id, type: 'cloud_poll_queued' });
    console.log(`[Print Queue] Order ${order.id} queued for cloud printing.`);
  } catch (error: any) {
    console.error('Cloud Print Error:', error);
    FaloodaTelemetry.track('pos_print_error', { orderId: order.id, error: error.message });
    throw error;
  }
};

export const printBooking = async (booking: any, config: PrinterConfig): Promise<void> => {
  FaloodaTelemetry.track('pos_print_booking', { bookingId: booking.id });
  const url = `${config.protocol}://${config.ip}/cgi-bin/epos/service.cgi?devid=local_printer&timeout=5000`;
  
  let xml = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
<s:Body>
  <epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">
    <text align="center" smooth="true" width="2" height="2">NEW BOOKING&#10;</text>
    <text align="center">TASTE OF VILLAGE&#10;&#10;</text>
    <text align="left">Name: ${booking.customerName || booking.name || 'Guest'}&#10;</text>
    <text align="left">Phone: ${booking.customerPhone || booking.phone || 'N/A'}&#10;</text>
    <text align="left">Date: ${new Date(booking.date).toLocaleDateString()}&#10;</text>
    <text align="left">Time: ${booking.time}&#10;</text>
    <text align="left" width="2" height="2">Guests: ${booking.guests}&#10;</text>
    <text align="left">Status: ${booking.status}&#10;</text>
    <text>------------------------------------------&#10;</text>
    <text align="center">&#10;Please check the booking tab&#10;</text>
    <feed unit="30"/>
    <cut type="feed"/>
  </epos-print>
</s:Body>
</s:Envelope>`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: xml,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error('Printer returned ' + res.status);
  } catch (err: any) {
    console.error('ePOS Print Error (Booking):', err);
    FaloodaTelemetry.track('pos_print_error', { bookingId: booking.id, error: err.message });
    throw err;
  }
};

export const printZReport = async (summary: any, config: PrinterConfig): Promise<void> => {
  const url = `${config.protocol}://${config.ip}/cgi-bin/epos/service.cgi?devid=local_printer&timeout=6000`;

  let xml = `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
<s:Body>
  <epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">
    <text align="center" smooth="true" width="2" height="2">TASTE OF VILLAGE&#10;</text>
    <text align="center" smooth="true" width="2" height="2">Z-REPORT&#10;</text>
    <text align="center">${summary.date || new Date().toLocaleString()}&#10;</text>
    <text>------------------------------------------&#10;</text>
    <text invert="true" align="center"> TOP SELLERS </text><text>&#10;</text>`;

  if (summary.top_items && summary.top_items.length > 0) {
    summary.top_items.forEach((item: any) => {
      xml += `<text align="left">${item.quantity}x ${item.name} (&#163;${(item.revenue || 0).toFixed(2)})&#10;</text>`;
    });
  } else {
    xml += `<text align="center">No items sold today&#10;</text>`;
  }

  xml += `<text>------------------------------------------&#10;</text>
    <text invert="true" align="center"> PAYMENTS </text><text>&#10;</text>
    <text align="left">Cash Transactions      &#163;${(summary.cash_total || 0).toFixed(2)}&#10;</text>
    <text align="left">Card Transactions      &#163;${(summary.card_total || 0).toFixed(2)}&#10;</text>
    <text align="left">Dojo (Automated)       &#163;${(summary.dojo_total || 0).toFixed(2)}&#10;</text>`;

  if (summary.refund_total > 0) {
    xml += `<text align="left" color="color_2">Refunds (${summary.refund_count})         -&#163;${(summary.refund_total || 0).toFixed(2)}&#10;</text>`;
  }

  xml += `<text>------------------------------------------&#10;</text>
    <text align="left">Orders Today:  ${summary.order_count || 0}&#10;</text>
    <text align="left" width="2" height="2">TOTAL REVENUE:    &#163;${(summary.total_revenue || 0).toFixed(2)}&#10;</text>
    <text align="center">&#10;END OF REPORT&#10;</text>
    <feed unit="30"/>
    <cut type="feed"/>
  </epos-print>
</s:Body>
</s:Envelope>`;

  // Retry logic: attempt twice for iPad WiFi reliability
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(url, { 
        method: 'POST', 
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }, 
        body: xml,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error('Printer returned ' + res.status);
      return; // Success
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;
      if (attempt === 0) await new Promise(r => setTimeout(r, 500));
    }
  }
  throw lastError;
};

