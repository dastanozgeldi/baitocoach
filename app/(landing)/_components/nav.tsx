import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Nav() {
  return (
    <nav className="flex w-full items-center justify-between border-t border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        <Image
          className="size-7 rounded-full"
          src="/logo.png"
          alt="Baito Coach Logo"
          width={100}
          height={100}
        />
        <h1 className="text-base font-bold md:text-2xl">Baito Coach</h1>
      </div>
      <Button className="w-24 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 md:w-32 dark:bg-white dark:text-black dark:hover:bg-gray-200">
        <Link href="/sign-in">Login</Link>
      </Button>
    </nav>
  );
}
