"use server";

import { prisma } from "@/lib/db";

export async function createUser(formData:FormData) {
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;

    if(!email && !name) return;

    const data = await prisma.user.create({
        data:{
            email: email,
            name: name,
            createdAt: new Date()
        }
    })
    return data;
}

export async function getAllUser() {
    "use cache"
    const allUsers = await prisma.user.findMany();
    return allUsers;
}