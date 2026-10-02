import Link from "next/link";
import React from 'react'

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center p-6">
      <h1 className="text-3xl font-bold">LoginPage</h1>
      <p className="text-gray-600">
        Ye page <code>app/page.js</code> ke <code>redirect("/login")</code> se aata hai.
      </p>
      <Link href="/" className="border px-4 py-2 rounded">
        Home par wapas jao (redirect() = replace, isliye seedha /)
      </Link>
    </div>
  );
}

export default LoginPage