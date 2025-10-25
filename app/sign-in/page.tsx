"use client";

import { AuthForm } from "@/components/auth-form";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignInPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session) {
      router.push("/call");
    }
  }, [session, isPending, router]);

  // Show nothing while checking session or redirecting
  if (isPending || session) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AuthForm />
    </div>
  );
}
