function getInvoicePaymentStatus(totalAmount, paidAmount) {
  const total = Number(totalAmount);
  const paid = Number(paidAmount);
  if (!Number.isFinite(total) || !Number.isFinite(paid)) {
    throw new TypeError("Invoice and paid amounts must be finite numbers.");
  }

  const status = total <= 0 || paid >= total ? "paid" : "partial";
  return { status, paymentStatus: status };
}

module.exports = { getInvoicePaymentStatus };
