"use client"
import { usePathname } from "next/navigation";

export default function Home() {
  const pathname = usePathname();
  return (
  <h1>Current PathName: {pathname}</h1>
  );
}
