import test from 'node:test';
import assert from 'node:assert/strict';
import { requestReturn, approveReturn, refundAfterInspection } from '../src/returns/returnService.js';

const DAY = 24 * 60 * 60 * 1000;
const order = (daysAgo, extra = {}) => ({ deliveredAt: Date.now() - daysAgo * DAY, ...extra });

test('a return inside the window waits for agent approval', () => {
  assert.deepEqual(requestReturn(order(3)), { ok: true, status: 'pending_review' });
});

test('a return after the window is rejected', () => {
  assert.equal(requestReturn(order(20)).ok, false);
});

test('sale items are final sale', () => {
  assert.equal(requestReturn(order(1, { saleItem: true })).ok, false);
});

test('an agent approval emails the label', () => {
  const r = approveReturn({ status: 'pending_review' }, 'agent-7');
  assert.equal(r.status, 'approved');
  assert.equal(r.labelDelivery, 'email');
});

test('refunds go to the original payment method after inspection', () => {
  assert.equal(refundAfterInspection({ status: 'inspected' }).refundTo, 'original_payment_method');
});
