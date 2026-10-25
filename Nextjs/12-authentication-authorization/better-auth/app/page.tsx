import { requireAuth } from "@/lib/auth-guard";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await requireAuth();
  const { user } = session;

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-500 font-sans dark:bg-black">
      {user.image ? (
        <Image
          src={user.image}
          alt="user-image"
          className="h-20 w-20 object-contain rounded-full"
          width={80}
          height={80}
        />
      ) : (
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
          <span className="text-muted-foreground">{user.name?.[0] || "?"}</span>
        </div>
      )}
    </div>
  );
}
