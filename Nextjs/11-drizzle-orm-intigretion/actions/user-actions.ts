"use server";

import {db} from "@/lib/db/index";
import {users} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { use } from "react";

interface UserData {
    email: string;
    password: string
}

export async function createUser(data:UserData) {
    await db.insert(users).values({
        email: data.email,
        password: data.password
    })
}

export async function getUser() {
    return await db.select().from(users);
}

export async function userById(id:number) {
    return await db.select().from(users).where(eq(users.id, id))
}

export async function updateUser(id:number, data:{email?:string}) {
    await db.update(users).set({...data, updatedAt: new Date()}).where(eq(users.id, id))
}

export async function deleteUser(id:number) {
    await db.delete(users).where(eq(users.id, id))
}