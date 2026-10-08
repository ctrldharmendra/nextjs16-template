"use client"
import React, { useEffect, useState } from 'react'
import { clientApi } from '@/lib/client-api'


const page =() => {

      const [users, setUsers] = useState([]) 

  useEffect(() => {
    async function load() {
      const res = await clientApi('/users') // 401 aaya to khud refresh + retry
      const json = await res.json()
      setUsers(json?.data || [])
    }
    load()
  }, [])

  console.log(users)
  return (
    <div>
        <h1>Client Side</h1>
    </div>
  )
}

export default page