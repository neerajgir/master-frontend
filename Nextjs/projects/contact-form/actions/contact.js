"use server";

import { connectDB } from "@/lib/db";
import Contact from "@/lib/models/Contact";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createContact(formData) {
  await connectDB();

  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");

  let isSuccess = false;

  try {
    const newContact = await Contact.create({ name, email, message });
    isSuccess = true;
  } catch (error) {
    console.error("Failed to save contact:", error);
    return { success: false, error: error.message };
  }

  if (isSuccess) {
    redirect("/dashboard");
  }
}

export async function updateStatus(id) {
  await connectDB();
  await Contact.findByIdAndUpdate(id, {
    status: "Resolved"
  })
  revalidatePath("/dashboard")
}
