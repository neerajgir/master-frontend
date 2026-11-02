"use server";

import { revalidateTag } from "next/cache";

export async function getUserList() {
    const res = await fetch("https://6ae8afcc1a7b15aaa50f618e.mockapi.io/api/users/users", {
    // cache: "no-store"
    next:{
      tags:["users"],
    //   revalidate: 20
    }
  });
  
  const data = await res.json();
  return data
}

export async function updateList() {
    revalidateTag("users", "max")
}