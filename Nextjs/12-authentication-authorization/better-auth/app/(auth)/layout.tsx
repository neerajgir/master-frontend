import { requireUnAuth } from "@/lib/auth-guard";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUnAuth();
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      {children}
    </div>
  );
}