"use client"


import axios from 'axios'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

const page = () => {
    const router = useRouter()
    const [email, setemail] = useState('')
    const [password, setpassword] = useState('')

const handleLogin = async (e) =>{
    e.preventDefault()
    
try {
  const response = await axios.post('/api/auth/login', {
            email,
            password,
        });

        if(response?.status === 200){
            console.log(response?.data)
            router.push('/')
            return response?.data
        }

} catch (error) {
    console.log("STATUS:", error.response?.status);
    console.log("DATA:", error.response?.data);
    console.log("MESSAGE:", error.message);
   return error.response?.data?.errors;
}
}


  return (
    <div>

<input type="text" value={email} placeholder='email' onChange={(e)=>{setemail(e.target.value)}}/>
<input value={password} type="password" placeholder='password' onChange={(e)=>{setpassword(e.target.value)}}/>

<button type='submit' onClick={handleLogin}>Login</button>  


    </div>
  )
}

export default page