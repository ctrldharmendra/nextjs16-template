import axios from "axios";
import Image from "next/image";
import { cookies } from "next/headers";




export default async function Home() {

const cookieStore = await cookies();
const accessToken = cookieStore.get("accessToken")?.value;




const getUsser = async()=>{
if(!accessToken) throw new Error("Access Token Not Found")

    try {
    const response = await axios.get(`${process.env.BASE_API}/api/users`, {
      headers:{
        Authorization: `Bearer ${accessToken}`,
      }
    });
    return response?.data;
  } catch (error) {
    // console.log("STATUS:", error);
    return error;
  }

}


const user = await getUsser()
console.log(user)
  return (
<>
<h1>Protected</h1>
{
  user?.statusCode == 200 && <p>{user?.data}</p>
}

{
  user?.response?.data?.errors && <p>{user?.response?.data?.errors}</p>
}

</>
  );
}
