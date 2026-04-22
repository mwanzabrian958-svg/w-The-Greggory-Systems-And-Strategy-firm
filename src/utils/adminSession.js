import { API_BASE_URL } from '../services/api'

const TOKEN_KEY = 'gf_admin_session_token'

const LEGACY_KEYS = ['admin_authenticated', 'admin_code_validated', 'admin_user', 'admin_session']

// Note: We no longer clear tokens on page load to allow session persistence
// Admin/Developer sessions are now maintained across page refreshes
// To properly logout, use the logout button

export function clearLegacyAdminStorage() {
  LEGACY_KEYS.forEach((k) => {
    try {
      localStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  })
}

function emitAdminSessionChanged() {
  try {
    window.dispatchEvent(new Event('gf-admin-session-changed'))
  } catch {
    /* ignore */
  }
}

export function getAdminToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAdminToken(token) {
  clearLegacyAdminStorage()
  sessionStorage.setItem(TOKEN_KEY, token)
  emitAdminSessionChanged()
}

export function clearAdminSession() {
  clearLegacyAdminStorage()
  try {
    sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
  emitAdminSessionChanged()
}

export function hasAdminToken() {
  return !!getAdminToken()
}

export async function verifyAdminSession() {
  const token = getAdminToken()
  if (!token) {
    clearLegacyAdminStorage()
    return { ok: false, user: null }
  }
  try {
    const res = await fetch(`${API_BASE_URL}/admin/session`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.success || !data.user) {
      clearAdminSession()
      return { ok: false, user: null }
    }
    return { ok: true, user: data.user }
  } catch {
    clearAdminSession()
    return { ok: false, user: null }
  }
}

export async function adminAuthenticate(credentials) {
  console.log(`[ADMIN AUTH] Sending request to ${API_BASE_URL}/admin/authenticate`, credentials.email)
  try {
    const res = await fetch(`${API_BASE_URL}/admin/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    console.log(`[ADMIN AUTH] Response status: ${res.status}`)
    const data = await res.json().catch((e) => {
      console.error(`[ADMIN AUTH] JSON parse error:`, e)
      return {}
    })
    console.log(`[ADMIN AUTH] Response data:`, { success: data.success, hasToken: !!data.token, message: data.message })
    return { ok: res.ok && data.success === true, data }
  } catch (err) {
    console.error(`[ADMIN AUTH] Network error:`, err)
    return { ok: false, data: { message: 'Network error. Please check your connection.' } }
  }
}

// Developer authentication
export async function developerAuthenticate(credentials) {
  console.log(`[DEV AUTH] Sending request to ${API_BASE_URL}/developer/authenticate`, credentials.email)
  try {
    const res = await fetch(`${API_BASE_URL}/developer/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    console.log(`[DEV AUTH] Response status: ${res.status}`)
    const data = await res.json().catch((e) => {
      console.error(`[DEV AUTH] JSON parse error:`, e)
      return {}
    })
    console.log(`[DEV AUTH] Response data:`, { success: data.success, hasToken: !!data.token, message: data.message })
    return { ok: res.ok && data.success === true, data }
  } catch (err) {
    console.error(`[DEV AUTH] Network error:`, err)
    return { ok: false, data: { message: 'Network error. Please check your connection.' } }
  }
}
