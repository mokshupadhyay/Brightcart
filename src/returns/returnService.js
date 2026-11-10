import { RETURN_WINDOW_DAYS, REQUIRE_AGENT_APPROVAL, STORE_CREDIT_ON_CARRIER_SCAN } from './config.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export function isWithinWindow(order, now = Date.now()) {
  return now - order.deliveredAt <= RETURN_WINDOW_DAYS * DAY_MS;
}

// Customers start a return themselves from Orders > Return item. Eligible items are approved automatically
// and the prepaid return label is shown right away.
export function requestReturn(order, now = Date.now()) {
  if (order.saleItem) return { ok: false, reason: 'Sale items are final sale.' };
  if (!isWithinWindow(order, now)) return { ok: false, reason: `The ${RETURN_WINDOW_DAYS}-day return window has passed.` };
  if (REQUIRE_AGENT_APPROVAL) return { ok: true, status: 'pending_review' };
  return { ok: true, status: 'approved', labelDelivery: 'shown_immediately' };
}

// Only used when REQUIRE_AGENT_APPROVAL is switched back on.
export function approveReturn(ret, agent) {
  if (ret.status !== 'pending_review') throw new Error('Only pending requests can be approved.');
  return { ...ret, status: 'approved', approvedBy: agent, labelDelivery: 'shown_immediately' };
}

// Instant store credit: issued as soon as the carrier scans the package.
export function onCarrierScan(ret, amount) {
  if (!STORE_CREDIT_ON_CARRIER_SCAN || ret.refundChoice !== 'store_credit') return ret;
  return { ...ret, status: 'credited', storeCredit: amount };
}

// A refund to the original payment method is still available, after the warehouse has inspected the item.
export function refundAfterInspection(ret) {
  if (ret.status !== 'inspected') throw new Error('The item has not been inspected yet.');
  return { ...ret, status: 'refunded', refundTo: 'original_payment_method' };
}
