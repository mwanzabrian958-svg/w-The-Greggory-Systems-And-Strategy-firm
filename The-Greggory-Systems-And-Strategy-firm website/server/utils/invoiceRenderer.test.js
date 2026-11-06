const test = require("node:test");
const assert = require("node:assert/strict");
const zlib = require("node:zlib");
const { buildDocumentEmailHtml, generatePDFContent } = require("../lib/invoiceRenderer");

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

const extractPdfTextBlocks = (pdf) =>
    [...pdf.toString("latin1").matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)]
        .flatMap((match) => {
            try {
                const stream = zlib.inflateSync(Buffer.from(match[1], "latin1")).toString("latin1");
                return [...stream.matchAll(/BT([\s\S]*?)ET/g)].map(([, block]) => {
                    const matrix = block.match(/1 0 0 1 ([\d.-]+) ([\d.-]+) Tm/);
                    return {
                        text: [...block.matchAll(/<([\da-f]+)>/gi)]
                            .map(([, hex]) => Buffer.from(hex, "hex").toString("latin1"))
                            .join(""),
                        y: matrix ? Number(matrix[2]) : null,
                    };
                });
            } catch {
                return [];
            }
        });

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

test("invoice totals stay below service rows without overlapping them", async () => {
    const pdf = await generatePDFContent("invoice", {
        ...sampleDocument,
        id: 1,
        invoice_number: "INV-LAYOUT-1",
        status: "draft",
        client_name: "Client",
        client_type: undefined,
        client_company: undefined,
        client_email: "client@example.test",
        client_phone: undefined,
        client_address: "Nairobi",
        tax_rate: 0.16,
        total_amount: 20000,
        items: [
            { description: "SERVICE", quantity: 1, unit_price: 17241.38, line_total: 17241.38 },
        ],
    });
    const blocks = extractPdfTextBlocks(pdf);
    const serviceRow = blocks.find((block) => block.text === "SERVICE");
    const subtotal = blocks.find((block) => block.text === "Subtotal");

    assert.ok(serviceRow && subtotal, "Expected both the service row and one subtotal.");
    assert.ok(
        serviceRow.y - subtotal.y >= 28,
        `Expected subtotal below the service row with clear spacing; service y=${serviceRow.y}, subtotal y=${subtotal.y}.`
    );
    assert.equal(blocks.filter((block) => block.text === "Subtotal").length, 1);
});

test("invoice email directs clients to the attached canonical PDF instead of rendering a second invoice", () => {
    const html = buildDocumentEmailHtml("invoices", sampleDocument, "Please review <today>.");

    assert.match(html, /complete invoice and payment details/);
    assert.match(html, /Please review &lt;today&gt;\./);
    assert.doesNotMatch(html, /SERVICE ITEMS|<th[^>]*>Description|Subtotal/);
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
