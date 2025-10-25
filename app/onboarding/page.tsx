import { redirect } from "next/navigation";
import { OnboardingForm } from "./_components/onboarding-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to sign-in if not authenticated
  if (!session?.user) {
    redirect("/sign-in");
  }

  // Redirect to call page if already onboarded
  if (session.user.isOnboarded) {
    redirect("/call");
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20 py-12 px-4">
      <OnboardingForm />
    </div>
  );
}
