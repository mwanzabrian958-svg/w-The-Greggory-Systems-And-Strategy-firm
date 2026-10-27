const test = require("node:test");
const assert = require("node:assert/strict");
const { buildClientInvoices } = require("./clientInvoices");

test("combines portal and standard invoices without conflating table ids", () => {
  const invoices = buildClientInvoices(
    [{ id: 8, invoice_number: "PORTAL-8", amount: "1000", status: "sent", issue_date: "2026-01-01" }],
    [{ id: 8, invoice_number: "STANDARD-8", total_amount_kes: "1160", status: "sent", issue_date: "2026-01-02" }],
  );

  assert.equal(invoices.length, 2);
  assert.deepEqual(invoices.map((invoice) => invoice.source), ["invoices", "project_invoices"]);
  assert.deepEqual(invoices.map((invoice) => invoice.id), [8, 8]);
  assert.deepEqual(invoices.map((invoice) => invoice.amount), [1160, 1000]);
});

test("uses the invoice total in KES and paid payment status for standard invoices", () => {
  const [invoice] = buildClientInvoices([], [{
    id: 4,
    invoice_number: "INV-4",
    subtotal: "100",
    total_amount: "116",
    total_amount_kes: "14500",
    status: "sent",
    payment_status: "paid",
  }]);

  assert.equal(invoice.amount, 14500);
  assert.equal(invoice.status, "paid");
});

test("falls back to the original amount when a portal invoice has no KES conversion", () => {
  const [invoice] = buildClientInvoices([{
    id: 5,
    amount: "825.50",
    amount_kes: "0",
  }]);

  assert.equal(invoice.amount, 825.5);
  assert.equal(invoice.source, "project_invoices");
});

test("falls back to the invoice total when the KES conversion is zero", () => {
  const [invoice] = buildClientInvoices([], [{
    id: 6,
    subtotal: "100",
    total_amount: "116",
    total_amount_kes: "0",
  }]);

  assert.equal(invoice.amount, 116);
});
