"use client";

import { useEffect } from "react";
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
        <div className="size-12 rounded-2xl bg-red-600/10 dark:bg-red-950/40 flex items-center justify-center animate-pulse border border-red-200 dark:border-red-900/50">
          <div className="size-6 rounded-full bg-red-600 animate-ping" />
        </div>
        <p className="text-sm font-semibold tracking-wide text-zinc-600 dark:text-zinc-400">
          Mengarahkan ke WorkPulse Telkom Akses...
        </p>
      </div>
    </div>
  );
}
