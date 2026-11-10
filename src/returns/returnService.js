import { RETURN_WINDOW_DAYS, REQUIRE_AGENT_APPROVAL } from './config.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export function isWithinWindow(order, now = Date.now()) {
  return now - order.deliveredAt <= RETURN_WINDOW_DAYS * DAY_MS;
}

// A customer emails support, an agent creates the request on their behalf.
export function requestReturn(order, now = Date.now()) {
  if (order.saleItem) return { ok: false, reason: 'Sale items are final sale.' };
  if (!isWithinWindow(order, now)) return { ok: false, reason: `The ${RETURN_WINDOW_DAYS}-day return window has passed.` };
  return { ok: true, status: REQUIRE_AGENT_APPROVAL ? 'pending_review' : 'approved' };
}

// An agent approves the request; the prepaid label is then emailed to the customer.
export function approveReturn(ret, agent) {
  if (ret.status !== 'pending_review') throw new Error('Only pending requests can be approved.');
  return { ...ret, status: 'approved', approvedBy: agent, labelDelivery: 'email' };
}

// Refunds go to the original payment method once the warehouse has inspected the item.
export function refundAfterInspection(ret) {
  if (ret.status !== 'inspected') throw new Error('The item has not been inspected yet.');
  return { ...ret, status: 'refunded', refundTo: 'original_payment_method' };
}
