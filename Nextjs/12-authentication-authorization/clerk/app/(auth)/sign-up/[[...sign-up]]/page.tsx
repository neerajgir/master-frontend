import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading registration...</div>}>
      <SignUp />
    </Suspense>
  );
}
