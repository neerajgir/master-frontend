import Image from "next/image";
import {connectDB} from "../lib/db.js"

export default async function Home() {
  await connectDB()
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold">Hello World</h1>
    </div>
  );
}
