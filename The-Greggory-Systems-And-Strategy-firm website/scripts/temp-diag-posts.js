// Temp: capture the 4 failing POST endpoints and print server error details
const http = require("http");

function post(path, body) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body);
    const req = http.request(
      { hostname: "localhost", port: 3000, path, method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) }, timeout: 20000 },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => { console.log(`\n${path} → ${res.statusCode}\n  ${d.substring(0, 300)}`); resolve(); });
      }
    );
    req.on("error", (e) => { console.log(`${path} → ERR ${e.message}`); resolve(); });
    req.on("timeout", () => { req.destroy(); console.log(`${path} → TIMEOUT`); resolve(); });
    req.write(data);
    req.end();
  });
}

(async () => {
  await post("/api/invoices", { title: "Diag Invoice", total_amount_kes: 1000, client_name: "Diag" });
  await post("/api/accounting-entries", { description: "Diag Entry", amount: 500, entry_type: "expense" });
  await post("/api/properties", { name: "Diag Property", price: 5000000 });
  await post("/api/projects/1/tasks", { task_name: "Diag Task", status: "pending", priority: "medium" });
  process.exit(0);
})();
