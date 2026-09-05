require("dotenv").config();
const http = require("http");
function req(method, path, body, token) {
  return new Promise((resolve) => {
    const data = body ? Buffer.from(JSON.stringify(body)) : null;
    const headers = { "Content-Type": "application/json" };
    if (data) headers["Content-Length"] = data.length;
    if (token) headers["Authorization"] = "Bearer " + token;
    const r = http.request({ hostname: "127.0.0.1", port: 3000, path, method, headers, timeout: 60000 }, (res) => {
      let b = ""; res.on("data", (c) => (b += c));
      res.on("end", () => { try { resolve({ s: res.statusCode, j: JSON.parse(b) }); } catch { resolve({ s: res.statusCode, b }); } });
    });
    r.on("error", (e) => resolve({ s: 0, e: e.message }));
    r.on("timeout", () => { r.destroy(); resolve({ s: 0, e: "timeout" }); });
    if (data) r.write(data); r.end();
  });
}
(async () => {
  const stamp = Date.now();
  const ae = `sendtest${stamp}@test.com`;
  await req("POST", "/api/admin-verification/register", { email: ae, password: "Test1234", first_name: "S", last_name: "T", role: "admin" });
  const login = await req("POST", "/api/admin-verification/authenticate-enhanced", { email: ae, password: "Test1234" });
  const at = login.j?.token;
  const inv = await req("POST", "/api/invoices", { title: "SendTest" + stamp, client_name: "C", client_email: ae, subtotal: 500, tax_type: "vat", tax_rate: "16", items: [{ description: "x", quantity: 1, unit_price: 500, line_total: 500 }] }, at);
  console.log("invoice:", inv.s, JSON.stringify(inv.j));
  const id = inv.j?.id;
  if (id) {
    console.log("calling send on invoice", id, "...");
    const send = await req("POST", `/api/invoices/${id}/send`, {}, at);
    console.log("send:", send.s, send.e || JSON.stringify(send.j));
  }
  process.exit(0);
})();
