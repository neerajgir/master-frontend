import { createContact } from "@/actions/contact";
import ContactForm from "@/components/contact-form";
import { connectDB } from "@/lib/db";
import Image from "next/image";

export default async function Home() {
  await connectDB();
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Contact Us</h1>
      <ContactForm action={createContact}/>
    </div>
  );
}
