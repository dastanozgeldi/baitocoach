"use client";

import { AuthForm } from "@/components/auth-form";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 p-4">
      <AuthForm />
    </div>
  );
}

