import { NextResponse } from 'next/server'

const API_URL = process.env.BACKEND_URL

export async function proxy(request) {
  const access = request.cookies.get('accessToken')?.value
  const refresh = request.cookies.get('refreshToken')?.value

  // have accessToken -> access allowed
  if (access) return NextResponse.next()

  // not have accessToken and not have refreshToken -> login
  if (!refresh) return NextResponse.redirect(new URL('/login', request.url))

  // access expire, refresh hai -> renew
const res = await fetch(`${API_URL}/api/auth/refreshToken`, {
    method: 'POST',
    headers: { cookie: `refreshToken=${refresh}` },
  })

  if (!res.ok) {
    const r = NextResponse.redirect(new URL('/login', request.url))
    r.cookies.delete('accessToken')
    r.cookies.delete('refreshToken')
    return r
  }

  const setCookies = res.headers.getSetCookie()

  // same request me Server Components ko naya token dikhe
  const merged = new Map()
  for (const part of (request.headers.get('cookie') ?? '').split('; ').filter(Boolean)) {
    const i = part.indexOf('=')
    merged.set(part.slice(0, i), part.slice(i + 1))
  }
  for (const c of setCookies) {
    const pair = c.split(';')[0]
    const i = pair.indexOf('=')
    merged.set(pair.slice(0, i), pair.slice(i + 1))
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(
    'cookie',
    [...merged].map(([k, v]) => `${k}=${v}`).join('; ')
  )

  // page aage bhejo + browser ko naye cookies do
  const response = NextResponse.next({ request: { headers: requestHeaders } })
  setCookies.forEach((c) => response.headers.append('set-cookie', c))
  return response
}

export const config = {
  matcher:  ['/', '/dashboard/:path*', '/serverside/:path*'], //protected page ko path yaha rakhne 
}