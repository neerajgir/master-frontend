"use server";

import { updateTag } from "next/cache";

// import { revalidateTag } from "next/cache";

// export async function getUserList() {
//     const res = await fetch("https://6ae8afcc1a7b15aaa50f618e.mockapi.io/api/users/users", {
//     // cache: "no-store"
//     next:{
//       tags:["users"],
//     //   revalidate: 20
//     }
//   });
  
//   const data = await res.json();
//   return data
// }

// export async function updateList() {
//     revalidateTag("users", "max")
// }

export async function deleteUser(id:string) {
  await fetch(`https://6ae8afcc1a7b15aaa50f618e.mockapi.io/api/users/users/${id}`,{
    method:'DELETE'
  });

  updateTag("users")
}
export async function addUser(name:string, avatar:string) {
  await fetch(`https://6ae8afcc1a7b15aaa50f618e.mockapi.io/api/users/users`,{
    method:'POST',
    headers:{'Content-type':'application/json'},
    body:JSON.stringify({name, avatar})
  });

  updateTag("users")
}

