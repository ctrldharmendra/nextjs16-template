import { redirect } from "next/navigation";
import { serverJson } from "@/lib/server-api";
import { Suspense } from "react";

async function UserContent() {
  const r = await serverJson("/users");
  if (r.status === 401 || r.status === 403) redirect("/login");
  if (!r.ok) return <p>{r.error || "Failed to fetch user data."}</p>;
  return <pre>{JSON.stringify(r.data, null, 2)}</pre>;
}

export default function Home() {
  return (
    <main>
      <h1>Protected</h1>

      <Suspense fallback={<p>Loading user data...</p>}>
        <UserContent />
      </Suspense>
    </main>
  );
}