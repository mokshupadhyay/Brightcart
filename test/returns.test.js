import test from 'node:test';
import assert from 'node:assert/strict';
import { requestReturn, approveReturn, onCarrierScan, refundAfterInspection } from '../src/returns/returnService.js';

const DAY = 24 * 60 * 60 * 1000;
const order = (daysAgo, extra = {}) => ({ deliveredAt: Date.now() - daysAgo * DAY, ...extra });

test('an eligible return is approved automatically and the label is shown immediately', () => {
  assert.deepEqual(requestReturn(order(3)), { ok: true, status: 'approved', labelDelivery: 'shown_immediately' });
});

test('the return window is 30 days', () => {
  assert.equal(requestReturn(order(25)).ok, true);
  assert.equal(requestReturn(order(35)).ok, false);
});

test('sale items are final sale', () => {
  assert.equal(requestReturn(order(1, { saleItem: true })).ok, false);
});

test('manual approval still works if it is switched back on', () => {
  const r = approveReturn({ status: 'pending_review' }, 'agent-7');
  assert.equal(r.labelDelivery, 'shown_immediately');
});

test('store credit is issued when the carrier scans the package', () => {
  const r = onCarrierScan({ status: 'approved', refundChoice: 'store_credit' }, 40);
  assert.equal(r.status, 'credited');
  assert.equal(r.storeCredit, 40);
});

test('a refund to the original payment method still waits for inspection', () => {
  assert.equal(refundAfterInspection({ status: 'inspected' }).refundTo, 'original_payment_method');
  assert.throws(() => refundAfterInspection({ status: 'approved' }));
});
