import { serverApi } from '@/lib/server-api'
import React from 'react'

const page = async() => {
  const res = await serverApi('/users')
  const data = await res.json()
console.log(data, "SSR")

  return (
    <div>
        Server Side
    </div>
  )
}

export default page