import { requireAuth } from "@/lib/auth-guard";
import Image from "next/image";

export default async function DashboardPage() {
  const session = await requireAuth();
  const { user } = session;

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-500 font-sans dark:bg-black">
      <div className="text-center p-8 bg-background rounded-lg shadow-md dark:bg-secondary">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="mb-4">Welcome, {user.name}!</p>
        <p className="mb-6">Email: {user.email}</p>
        <p className="text-sm text-muted-foreground">Role: {user.role}</p>
        {user.image && (
          <Image
            src={user.image}
            alt="User avatar"
            className="w-20 h-20 rounded-full mb-4 object-cover"
            width={80}
            height={80}
          />
        )}
      </div>
    </div>
  );
}