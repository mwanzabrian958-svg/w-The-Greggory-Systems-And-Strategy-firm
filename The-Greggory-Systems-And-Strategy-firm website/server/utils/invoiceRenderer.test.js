const test = require("node:test");
const assert = require("node:assert/strict");
const zlib = require("node:zlib");
const { generatePDFContent } = require("../lib/invoiceRenderer");

const sampleDocument = {
    id: 1793732447697,
    invoice_number: "INV-1793732447697",
    title: "Strategic systems advisory engagement",
    status: "completed",
    issue_date: "2026-11-01",
    due_date: "2026-11-15",
    completed_at: "2026-11-02T12:00:00.000Z",
    client_name: "Apex Capital Partners Ltd.",
    client_type: "Business client",
    client_company: "Apex Capital Partners Ltd.",
    client_email: "accounts@apexcapital.co.ke",
    client_phone: "+254 720 000 111",
    client_address: "Westlands, Nairobi, Kenya\nSuite 4B, 2nd Floor, The Strand",
    payment_method: "bank",
    tax_rate: "16",
    total_amount: 40800,
    currency: "KES",
    items: [
        { description: "Discovery workshop and project framing", quantity: 1, unit_price: 12000, line_total: 12000 },
        { description: "Architecture, implementation planning, and backlog validation", quantity: 1, unit_price: 18000, line_total: 18000 },
        { description: "System rollout support and reporting dashboard handoff", quantity: 1, unit_price: 10800, line_total: 10800 },
    ],
    payment_account_name: "Brian Mwanza",
    payment_phone: "+254 115 525 854",
    verified: true,
};

const extractPdfText = (pdf) =>
    [...pdf.toString("latin1").matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)]
        .map((match) => {
            try {
                const stream = zlib.inflateSync(Buffer.from(match[1], "latin1")).toString("latin1");
                return [...stream.matchAll(/\[((?:<[^>]+>|[-+]?(?:\d*\.)?\d+|\s)+)\]\s*TJ/g)]
                    .map((operation) =>
                        [...operation[1].matchAll(/<([\da-f]+)>/gi)]
                            .map(([, hex]) => Buffer.from(hex, "hex").toString("latin1"))
                            .join("")
                    )
                    .join(" ");
            } catch {
                return "";
            }
        })
        .join("\n");

const normalizePdfText = (text) => text.replace(/\s+/g, " ");

test("invoice PDF stays on a single A4 page for a standard client invoice", async () => {
    const pdf = await generatePDFContent("invoice", sampleDocument);
    const pageCount = (pdf.toString("latin1").match(/\/Type \/Page\b/g) || []).length;
    const text = normalizePdfText(extractPdfText(pdf));

    assert.ok(pageCount <= 1, `Expected a single-page invoice PDF, but generated ${pageCount} pages.`);
    assert.match(text, /Completed\s*&\s*Recorded\s+by/);
    assert.match(text, /marked as completed/);
    assert.match(text, /COMPLETION CERTIFICATE/);
    assert.match(text, /Subtotal/);
    assert.match(text, /Total/);
    assert.match(text, /PAYMENT OPTIONS/);
    assert.match(text, /Send Money/);
    assert.match(text, /Bank Transfer/);
    assert.match(text, /Thank you for your business/);
});

test("draft invoice wording stays issued when a completion timestamp is present", async () => {
    const pdf = await generatePDFContent("invoice", {
        ...sampleDocument,
        status: "draft",
        completed_at: "2026-11-02T12:00:00.000Z",
        verified: false,
    });
    const text = normalizePdfText(extractPdfText(pdf));

    assert.match(text, /Issued\s*&\s*Recorded\s+by/);
    assert.match(text, /INVOICE RECORD/);
    assert.match(text, /Invoice ID/);
    assert.doesNotMatch(text, /Completed\s*&\s*Recorded\s+by/);
    assert.doesNotMatch(text, /completion|completed/i);
});
