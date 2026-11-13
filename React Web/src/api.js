// Thin fetch wrapper for the Ember & Oak API. The session lives in an HttpOnly cookie,
// so there is no token handling in the browser.
export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message)
    this.status = status
    this.fields = fields || {}
  }
}

export async function api(method, path, body) {
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body !== undefined || method !== 'GET' ? { 'Content-Type': 'application/json' } : undefined,
      body: method === 'GET' ? undefined : JSON.stringify(body ?? {}),
    })
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0)
  }
  let data = null
  try { data = await res.json() } catch { /* empty body */ }
  if (!res.ok) throw new ApiError(data?.error || (res.status >= 500 ? `The server did not answer properly (HTTP ${res.status}). Please try again.` : `Something went wrong (HTTP ${res.status})`), res.status, data?.fields)
  return data
}
