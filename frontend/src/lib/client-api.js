// this is for client side : while calling any api call with help of this so after accesstoken get expired it renew on the basis on refreshtoken 

let refreshPromise = null

// ek time pe sirf ek refresh chalega
function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch('/api/auth/refreshToken', {
      method: 'POST',
      credentials: 'include',
    })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

export async function clientApi(path, options = {}) {
  const send = () =>
    fetch(`/api${path}`, { ...options, credentials: 'include' })

  let res = await send()

  if (res.status === 401 && !path.startsWith('/auth/')) {
    const ok = await refreshSession()
    if (ok) {
      res = await send() // wahi request dobara
    } else {
      window.location.href = '/login'
    }
  }
  return res
}