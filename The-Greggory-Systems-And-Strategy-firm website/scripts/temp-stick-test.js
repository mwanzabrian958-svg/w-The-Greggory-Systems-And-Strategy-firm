// Temp e2e: verify /admin/users/:id PUT actually persists (read-back check)
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
  const email = "sticktest" + Date.now() + "@test.com";
  const reg = await api("/api/admin-verification/register", "POST", { email, password: "StickTest123", first_name: "Stick", last_name: "Test", role: "admin" });
  const regJ = safeJson(reg.body);
  const adminId = regJ && regJ.userId;
  console.log("register admin:", reg.status, adminId ? "OK id=" + adminId : reg.body.substring(0,180));
  if (!adminId) process.exit(1);
  const login = await api("/api/admin-verification/authenticate-enhanced", "POST", { email, password: "StickTest123" });
  const tokJ = safeJson(login.body);
  const token = tokJ ? tokJ.token : null;
  console.log("login:", login.status, token ? "OK" : login.body.substring(0,180));
  if (!token) process.exit(1);

  const list = await api("/api/users", "GET", null, token);
  const listJ = safeJson(list.body);
  const users = (listJ && (listJ.users || listJ.data)) || [];
  console.log("list users count:", users.length);
  const clientUser = users.find((u) => u.source_table === "client" || u.source_table === "user") || users[0];
  console.log("editing:", clientUser ? `${clientUser.source_table} id=${clientUser.id} (${clientUser.email})` : "NONE");
  if (!clientUser) process.exit(0);

  const stamp = "Stick" + Date.now();
  const put = await api(
    "/api/admin/users/" + clientUser.id + "?role_type=" + (clientUser.source_table || "client"),
    "PUT",
    { first_name: clientUser.first_name || "Stick", last_name: clientUser.last_name || "Test", email: clientUser.email,
      role: "user", mission_briefing: stamp, is_active: true, department: "Ops-Dept",
      phone_number: clientUser.phone_number, physical_address: clientUser.physical_address,
      id_number: clientUser.id_number, alt_phone: clientUser.alt_phone, expertise: clientUser.expertise,
      private_notes: "e2e-stick-check", manual_projects: clientUser.manual_projects,
            emergency_contact_name: clientUser.emergency_contact_name, emergency_contact_phone: clientUser.emergency_contact_phone },
    token
  );
  console.log("PUT client:", put.status, put.body.substring(0,160));

  await sleep(500);
  const read = await api("/api/admin/users/" + clientUser.id + "?role_type=" + (clientUser.source_table || "client"), "GET", null, token);
  const readJ = safeJson(read.body);
  const got = readJ && readJ.user;
  console.log("GET back:", read.status, got ? `mission_briefing=${got.mission_briefing} private_notes=${got.private_notes}` : read.body.substring(0,160));
  console.log("PERSISTED:", (got && got.mission_briefing === stamp) ? "YES ✓" : "NO ✗");

  // Admin probe (mission_briefing + department persistence)
  const adminPut = await api(
    "/api/admin/users/" + adminId + "?role_type=admin",
    "PUT",
    { first_name: "Stick", last_name: "Admin", email,
      admin_level: "admin", department: "QA-Dept", mission_briefing: "admin-mission-" + stamp, is_active: true,
      phone_number: null, physical_address: null, id_number: null, alt_phone: null, expertise: null,
            private_notes: null, manual_projects: null, emergency_contact_name: null, emergency_contact_phone: null },
    token
  );
  console.log("PUT admin:", adminPut.status, adminPut.body.substring(0,140));
  await sleep(400);
  const aread = await api("/api/admin/users/" + adminId + "?role_type=admin", "GET", null, token);
  const aJ = safeJson(aread.body);
  const agot = aJ && aJ.user;
  console.log("GET admin back:", aread.status, agot ? `department=${agot.department} mission_briefing=${agot.mission_briefing}` : aread.body.substring(0,160));
  console.log("ADMIN DEPT PERSISTED:", (agot && agot.department === "QA-Dept") ? "YES ✓" : "NO ✗");
  console.log("ADMIN MISSION PERSISTED:", (agot && agot.mission_briefing === "admin-mission-" + stamp) ? "YES ✓" : "NO ✗");

  // Developer-role probe (table mapping hole?
  const devUser = users.find((u) => u.source_table === "developer");
  if (devUser) {
    console.log("\ndev probe: editing", devUser.id, devUser.email);
    const dput = await api("/api/admin/users/" + devUser.id + "?role_type=developer", "PUT", { first_name: devUser.first_name, last_name: devUser.last_name, email: devUser.email, role: "developer", mission_briefing: "dev-stick-probe", is_active: true, phone_number: null, physical_address: null, id_number: null, alt_phone: null, expertise: null, private_notes: null, manual_projects: null, emergency_contact_name: null, emergency_contact_phone: null }, token);
    console.log("PUT dev:", dput.status, dput.body.substring(0,180));
    const dread = await api("/api/admin/users/" + devUser.id + "?role_type=developer", "GET", null, token);
    const dJ = safeJson(dread.body);
    const dgot = dJ && dJ.user;
    console.log("GET dev back:", dread.status, dgot ? `mission_briefing=${dgot.mission_briefing} (from ${dJ.role_type})` : dread.body.substring(0,160));
  }
  process.exit(0);
})();