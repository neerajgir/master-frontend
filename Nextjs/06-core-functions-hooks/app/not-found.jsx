import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-6">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-gray-600">Aap jo page dhoond rahe ho, wo nahi mila.</p>
      <Link href="/" className="border px-4 py-2 rounded">Home par wapas jao</Link>
    </div>
  );
}