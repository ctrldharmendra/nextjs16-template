
import { Suspense } from "react";
import { serverJson } from "@/lib/server-api";

async function UsersContent() {
  const r = await serverJson("/users");
  console.log(r.data, "SSR");

  if (!r.ok) return <p>{r.error || "Failed to load users."}</p>;
  return <pre>{JSON.stringify(r.data, null, 2)}</pre>;
}

export default function Page() {
  return (
    <div>
      <h1>Server Side</h1>
      <Suspense fallback={<p>Loading users...</p>}>
        <UsersContent />
      </Suspense>
    </div>
  );
}