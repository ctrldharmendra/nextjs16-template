
// this file is for calling server side api 
import { cookies } from 'next/headers'
export async function serverApi(path) {

  const token = (await cookies()).get('accessToken')?.value

  return fetch(`${process.env.API_URL}/api${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
}