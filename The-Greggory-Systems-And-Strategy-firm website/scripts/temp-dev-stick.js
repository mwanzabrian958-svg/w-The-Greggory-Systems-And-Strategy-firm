// Temp e2e: developer-role update persistence (dev probe)
const http = require("http");

function api(path, method, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : "";
    const headers = { "Content-Type": "application/json" };
    if (data) headers["Content-Length"] = Buffer.byteLength(data);
    if (token) headers["Authorization"] = "Bearer " + token;
    const req = http.request({ hostname: "127.0.0.1", port: 3000, path, method, headers }, (res) => {
      let b = ""; res.on("data", (c) => (b += c)); res.on("end", () => resolve({ status: res.statusCode, body: b }));
    });
    req.on("error", reject); if (data) req.write(data); req.end();
  });
}
const safeJson = (b) => { try { return JSON.parse(b); } catch { return null; } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const email = "devstick" + Date.now() + "@test.com";
  await api("/api/admin-verification/register", "POST", { email, password: "DevStick123", first_name: "Dev", last_name: "Probe", role: "admin" });
  const login = await api("/api/admin-verification/authenticate-enhanced", "POST", { email, password: "DevStick123" });
  const loginJ = safeJson(login.body);
  const token = loginJ ? loginJ.token : null;
  if (!token) { console.log("login failed"); process.exit(1); }

  const stamp = "DevStick" + Date.now();
  const put = await api("/api/admin/users/4?role_type=developer", "PUT", {
    first_name: "Dev", last_name: "Probe", email: "brianmwanza651@gmail.com", role: "developer",
    department: "Dev-Dept", mission_briefing: stamp, is_active: true,
    phone_number: null, physical_address: null, id_number: null, alt_phone: null, expertise: null,
        private_notes: null, manual_projects: null, emergency_contact_name: null, emergency_contact_phone: null },
    token
  );
  console.log("PUT dev:", put.status, put.body.substring(0,140));
  await sleep(400);
  const read = await api("/api/admin/users/4?role_type=developer", "GET", null, token);
  const j = safeJson(read.body);
  const got = j && j.user;
  console.log("GET dev back:", read.status, got ? `department=${got.department} mission_briefing=${got.mission_briefing} role_type=${j.role_type}` : read.body.substring(0,160));
  console.log("DEV PERSISTED:", (got && got.mission_briefing === stamp) ? "YES ✓" : "NO ✗");
  process.exit(0);
})();