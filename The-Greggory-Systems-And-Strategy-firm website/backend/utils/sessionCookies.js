const ADMIN_SESSION_COOKIE = 'gf_admin_session';

function getCookie(req, name) {
  const cookieHeader = req.headers.cookie || '';
  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === name) {
      const value = part.slice(separator + 1).trim();
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  return null;
}

function cookieOptions(req) {
  const forwardedProto = req.get?.('x-forwarded-proto');
  const secure = req.secure || forwardedProto === 'https' || process.env.NODE_ENV === 'production';
  return `Path=/api; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`;
}

function setSessionCookie(res, req, name, token) {
  res.append(
    'Set-Cookie',
    `${name}=${encodeURIComponent(token)}; ${cookieOptions(req)}`,
  );
}

function clearSessionCookie(res, req, name) {
  res.append(
    'Set-Cookie',
    `${name}=; ${cookieOptions(req)}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
  );
}

module.exports = {
  ADMIN_SESSION_COOKIE,
  getCookie,
  setSessionCookie,
  clearSessionCookie,
};
