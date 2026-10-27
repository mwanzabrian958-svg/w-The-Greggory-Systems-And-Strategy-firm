function toAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function mapProjectInvoice(invoice) {
  const convertedAmount = toAmount(invoice.amount_kes);
  return {
    id: invoice.id,
    source: "project_invoices",
    invoiceNumber: invoice.invoice_number || null,
    project: invoice.project_name || invoice.client_name || "Engagement",
    amount: convertedAmount > 0 ? convertedAmount : toAmount(invoice.amount),
    status: String(invoice.status || "draft").toLowerCase(),
    dueDate: invoice.due_date || null,
    issueDate: invoice.issue_date || null,
    currency: "KES",
  };
}

function mapGeneralInvoice(invoice) {
  const convertedAmount = toAmount(invoice.total_amount_kes);
  const amount = convertedAmount > 0
    ? convertedAmount
    : invoice.total_amount ?? invoice.subtotal;
  const status = String(
    invoice.payment_status === "paid" ? "paid" : invoice.status || "draft",
  ).toLowerCase();
  return {
    id: invoice.id,
    source: "invoices",
    invoiceNumber: invoice.invoice_number || null,
    project: invoice.project_name || invoice.title || "Engagement",
    amount: toAmount(amount),
    status,
    dueDate: invoice.due_date || null,
    issueDate: invoice.issue_date || null,
    currency: "KES",
  };
}

function buildClientInvoices(projectInvoices = [], generalInvoices = []) {
  return [
    ...projectInvoices.map(mapProjectInvoice),
    ...generalInvoices.map(mapGeneralInvoice),
  ].sort((a, b) => {
    const dateOrder = new Date(b.issueDate || 0) - new Date(a.issueDate || 0);
    if (dateOrder) return dateOrder;
    return String(b.id).localeCompare(String(a.id), undefined, { numeric: true });
  });
}

module.exports = { buildClientInvoices, mapGeneralInvoice, mapProjectInvoice };
