import React, { Suspense } from "react";
import axios from "axios";
import { cacheTag, updateTag } from "next/cache";

async function getData() {
  "use cache";

  cacheTag("dummy");

  const res = await axios.get(
    `${process.env.BACKEND_URL}/api/dummy`
  );

  return res.data?.data ?? [];
}

async function DummyList() {
  const data = await getData();

  return (
    <div>
      {data.map((item, index) => (
        <div key={item._id ?? index}>
          <h2>{item.name}</h2>
        </div>
      ))}
    </div>
  );
}

export default function Page() {
  
  async function postData(formData) {
    "use server";

    const item = formData.get("item");

    if (typeof item !== "string" || !item.trim()) {
      throw new Error("Item is required");
    }

    await axios.post(
      `${process.env.BACKEND_URL}/api/dummy`,
      { item: item.trim() }
    );

    updateTag("dummy");
  }

  return (
    <div>
      <h1>Server</h1>

      <form action={postData}>
        <input
          type="text"
          name="item"
          placeholder="Enter item"
          required
        />
        <button type="submit">Submit</button>
      </form>

      <Suspense fallback={<div>Loading data...</div>}>
        <DummyList />
      </Suspense>
    </div>
  );
}