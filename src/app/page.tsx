"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getActiveUserFromStorage } from "@/lib/api";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const activeUser = getActiveUserFromStorage();
    if (activeUser) {
      if (activeUser.role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/karyawan/dashboard");
      }
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <div className="size-16 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-lg border border-zinc-200 dark:border-zinc-800 animate-pulse">
          <Image
            src="/workpulse.png"
            alt="WorkPulse"
            width={44}
            height={44}
            className="object-contain"
            priority
          />
        </div>
        <p className="text-sm font-semibold tracking-wide text-zinc-600 dark:text-zinc-400">
          Mengarahkan ke WorkPulse Telkom Akses...
        </p>
      </div>
    </div>
  );
}
