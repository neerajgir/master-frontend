import { redirect } from "next/navigation";

const Home = () => {
  // ── redirect() demo ──────────────────────────────────────
  // isLoggedIn = false karke dekho → browser turant /login par chala jayega
  const isLoggedIn = true;

  if (!isLoggedIn) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center p-6">
      <h1 className="text-3xl font-bold">redirect() Demo</h1>
      <p className="text-gray-600">
        Ye page tabhi dikhega jab <code>isLoggedIn = true</code> ho.
      </p>
      <p className="text-gray-600">
        <code>app/page.js</code> mein <code>isLoggedIn = false</code> karke refresh karo —
        browser seedha <b>/login</b> par redirect ho jayega (307).
      </p>
      <a href="/shop/dashboard" className="border px-4 py-2 rounded">
        Shop Dashboard par jao
      </a>
    </div>
  );
};

export default Home;