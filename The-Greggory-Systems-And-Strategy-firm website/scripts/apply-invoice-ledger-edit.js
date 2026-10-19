/* One-off helper: insert the accounting_entries ledger block into
 * POST /api/invoices (server.js).
 * Safe to run multiple times — it checks before replacing.
 * NOTE: server.js uses CRLF (\r\n) line endings.
 */
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'server.js');
let content = fs.readFileSync(filePath, 'utf8');

// Guard: skip if already applied
if (content.includes('ledger entry skipped')) {
  console.log('Ledger block already present — skipping.');
  process.exit(0);
}

// The file uses \r\n line endings — match exactly.
const oldText = [
  "        } catch (pushErr) { console.warn('[INVOICE] push skipped:', pushErr.message); }",
  "     }",
  "     res.status(201).json({ success: true, id: result.insertId });",
].join('\r\n');

const newLines = [
  "        } catch (pushErr) { console.warn('[INVOICE] push skipped:', pushErr.message); }",
  "     }",
  "     // Ledger: create an accounting_entries row so the invoice appears in the billing ledger",
  "     // (fire-and-forget; a ledger failure must never roll back the invoice itself).",
  "     try {",
  "       const taxAmount = Number(((subtotal || 0) * (tax_rate || 0)).toFixed(2));",
  "       await mainDb.query(",
  "         `INSERT INTO accounting_entries",
  "           (entry_type, category, amount, tax_amount, currency, exchange_rate,",
  "            transaction_date, transaction_reference, payment_method, payment_status,",
  "            description, notes, tax_rate, tax_region, project_id, invoice_id,",
  "            client_email, created_by, created_at)",
  "         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,",
  "         [",
  "           'invoice', 'income', subtotal, taxAmount,",
  "           req.body.currency || 'KES', 1,",
  "           issue_date, invoice_number, null, 'pending',",
  "           title, req.body.notes || null,",
  "           tax_rate, 'KE', project_id, result.insertId,",
  "           client_email || null, userId,",
  "         ]",
  "       );",
  "     } catch (ledgerErr) {",
  "       console.warn('[INVOICE] ledger entry skipped:', ledgerErr.message);",
  "     }",
  "",
  "     res.status(201).json({ success: true, id: result.insertId });",
];
const newText = newLines.join('\r\n');

if (!content.includes(oldText)) {
  console.error('ERROR: anchor text not found.');
  process.exit(1);
}

content = content.replace(oldText, newText);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Ledger block inserted into POST /api/invoices.');


