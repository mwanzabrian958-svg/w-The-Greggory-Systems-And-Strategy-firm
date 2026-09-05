const http = require('http');
const API = 'http://localhost:3000';

function api(path, method, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : "";
    const headers = { "Content-Type": "application/json" };
    if (data) headers["Content-Length"] = Buffer.byteLength(data);
    if (token) headers.Authorization = "Bearer " + token;
    const req = http.request({ hostname: "127.0.0.1", port: 3000, path, method, headers }, (res) => {
      let b = ""; res.on("data", (c) => (b += c)); res.on("end", () => resolve({ status: res.statusCode, body: b }));
    });
    req.on("error", reject); if (data) req.write(data); req.end();
  });
}
const J = (b) => { try { return JSON.parse(b); } catch { return null; } };

(async () => {
  const em = "phototest" + Date.now() + "@test.com";
  const reg = await api("/api/admin-verification/register", "POST", {
    email: em, password: "Test1234", first_name: "Photo", last_name: "Test", role: "admin"
  });
  console.log("1. REGISTER:", reg.status);

  const login = await api("/api/admin-verification/authenticate-enhanced", "POST", { email: em, password: "Test1234" });
  console.log("2. LOGIN:", login.status, "has_photo:", J(login.body)?.user?.has_photo);

  const tok = J(login.body)?.token;
  const uid = J(login.body)?.user?.id;
  const role = "admin";

  // 3. Session
  const sess = await api("/api/admin/session", "GET", null, tok);
  console.log("3. SESSION:", sess.status, "has_photo:", J(sess.body)?.user?.has_photo);

  // 4. Upload photo (tiny 1x1 PNG)
  const tinyPng = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
  const upload = await api("/api/admin/profile-photo", "POST", {
    userId: uid, role, profile_photo_base64: "data:image/png;base64," + tinyPng,
    profile_photo_mime_type: "image/png", profile_photo_file_name: "test.png"
  }, tok);
  console.log("4. UPLOAD:", upload.status, upload.body);

  // 5. Session again
  const sess2 = await api("/api/admin/session", "GET", null, tok);
  console.log("5. SESSION2:", sess2.status, "has_photo:", J(sess2.body)?.user?.has_photo);

  // 6. GET photo
  const photo = await api("/api/admin/profile-photo/" + role + "/" + uid, "GET", null, tok);
  console.log("6. PHOTO GET:", photo.status, "bytes:", Buffer.byteLength(photo.body, "binary"));

  // 7. DELETE photo
  const del = await api("/api/admin/profile-photo", "DELETE", { userId: uid, role }, tok);
  console.log("7. DELETE:", del.status, del.body);

  // 8. Session after delete
  const sess3 = await api("/api/admin/session", "GET", null, tok);
  console.log("8. SESSION3 (after delete):", sess3.status, "has_photo:", J(sess3.body)?.user?.has_photo);

  // 9. GET photo after delete
  const photo2 = await api("/api/admin/profile-photo/" + role + "/" + uid, "GET", null, tok);
  console.log("9. PHOTO GET (after delete):", photo2.status, J(photo2.body)?.message || photo2.body.substring(0, 80));

  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });

