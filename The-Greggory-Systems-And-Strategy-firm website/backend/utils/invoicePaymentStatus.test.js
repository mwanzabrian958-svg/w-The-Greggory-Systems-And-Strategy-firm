const test = require("node:test");
const assert = require("node:assert/strict");
const { getInvoicePaymentStatus } = require("./invoicePaymentStatus");

test("keeps an invoice partially paid while recorded payments are below its total", () => {
  assert.deepEqual(getInvoicePaymentStatus(53983, 20000), {
    status: "partial",
    paymentStatus: "partial",
  });
});

test("marks an invoice paid when recorded payments reach or exceed its total", () => {
  assert.deepEqual(getInvoicePaymentStatus(53983, 53983), {
    status: "paid",
    paymentStatus: "paid",
  });
  assert.deepEqual(getInvoicePaymentStatus(53983, 55000), {
    status: "paid",
    paymentStatus: "paid",
  });
});

test("rejects invalid financial amounts instead of returning a status", () => {
  assert.throws(() => getInvoicePaymentStatus("not-a-number", 10), TypeError);
});
