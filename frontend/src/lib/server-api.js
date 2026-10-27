
// this file is for calling server side api 
import "server-only";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL;

export async function serverApi(path, options = {}) {
  const token = (await cookies()).get("accessToken")?.value;
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(`${BACKEND}/api${path}`, { ...options, headers, cache: "no-store" });
}

// JSON + status , so we dont need to write res.json() frequently in page.js
export async function serverJson(path, options) {
  const res = await serverApi(path, options);
  const body = await res.json().catch(() => null); // no crash on non-JSON error
  return { ok: res.ok, status: res.status, data: body?.data ?? null, error: body?.errors };
}

// -----------------
// Now can call any protected endpoint without manually adding the token:
    // const res = await serverApi("/users");
    // const user = await res.json();


// For a POST request:

// to show post error 
  // const [state, formAction, pending] = useActionState(addUser, { ok: true, error: null });

// const res = await serverJson("/users", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   body: JSON.stringify({
//     name: "Test User",
//   }),
// });

// DELEET 
// export async function deleteUser(id) {
//   const r = await serverJson(`/users/${id}`, { method: 'DELETE' });

//   if (r.status === 401 || r.status === 403) redirect('/login');
//   if (!r.ok) throw new Error(r.error || 'Delete failed');

//   refresh();
// }
//  <li key={u.id}>
//           {u.name}
//           <form action={deleteUser.bind(null, u.id)}>
//             <button type='submit'>Delete</button>
//           </form>
//         </li>
// DELETE END


// The helper automatically attaches the cookie's access token.
// Note: The helper expects paths such as "/users", not "/api/users", because it already adds /api to the URL.