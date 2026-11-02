import {cacheLife, cacheTag} from "next/cache";

export async function getUsers() {
    "use cache"
    cacheLife("hours");
    cacheTag("users");

    const res = await fetch("https://6ae8afcc1a7b15aaa50f618e.mockapi.io/api/users/users");
    return res.json();
}