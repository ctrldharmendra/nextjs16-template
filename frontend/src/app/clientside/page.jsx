"use client"
import React, { use, useEffect, useState } from 'react'
import {  getJson } from '@/lib/client-api'


const page =() => {

      const [users, setUsers] = useState([]) 

  useEffect(() => {
    async function load() {
       const res = await getJson('/users'); // 401 do refresh and retry
         if (!res.ok) setError(res.error || 'Failed to load users');
      setUsers(res?.data || [])
    }
    load()
  }, [])

  console.log(users, "user")
  return (
    <div>
        <h1>Client Side</h1>

        {
          users?.map((user, index) => (
            <div key={index}>
              <h2>{user.username}</h2>
            </div>
          ))
        }
    </div>
  )
}

export default page