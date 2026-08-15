import { ArrowRight, Activity, Users, Calendar } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-white dark:bg-zinc-950 overflow-hidden selection:bg-red-500/30">
      {/* Background decorations */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex flex-col justify-between">
        {/* Top ambient glow */}
        <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[150%] sm:w-[100%] aspect-[1/0.5] rounded-[100%] bg-gradient-to-b from-red-100 via-white to-transparent dark:from-red-950/20 dark:via-zinc-950 dark:to-transparent blur-3xl opacity-60" />
        
        {/* Animated Target Circles Background */}
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] sm:w-[1200px] sm:h-[1200px] flex items-center justify-center opacity-50 dark:opacity-50 pointer-events-none z-0 [mask-image:linear-gradient(to_bottom,black_40%,transparent_70%)]">
          <div className="absolute w-full h-full rounded-full border-[2px] border-red-500/60 border-dashed animate-[spin_60s_linear_infinite]"></div>
          <div className="absolute w-[80%] h-[80%] rounded-full border-[2px] border-red-500/40 animate-pulse"></div>
          <div className="absolute w-[60%] h-[60%] rounded-full border-[3px] border-red-500/30 border-dashed animate-[spin_40s_linear_infinite_reverse]"></div>
          <div className="absolute w-[40%] h-[40%] rounded-full border-[4px] border-red-500/20 animate-pulse"></div>
          <div className="absolute w-[20%] h-[20%] rounded-full bg-red-500/20 animate-[ping_3s_ease-in-out_infinite]"></div>
        </div>

        {/* Dark Red Waves (Dunes) strictly in front of Target */}
        <div className="absolute bottom-[10%] sm:bottom-[5%] left-0 right-0 w-full h-[300px] sm:h-[400px] z-10 [mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)]">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg">
            {/* Back Wave */}
            <path d="M0,24C164,68,264,124,472,108,704,90,832,24,1064,24c52,0,102.4,8.8,136,21.6V120H0Z" fill="#38050e" />
            {/* Middle Wave */}
            <path d="M0,75.2C118.4,124.8,291.6,152,500,104,746,47.2,886.8,19.2,1093.6,56,1151.2,66.4,1184.4,76,1200,81.6V120H0Z" fill="#580816" />
            {/* Front Wave */}
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C52.16,93.42,103.88,86.2,154.5,77.58,211.23,67.92,267.47,66.69,321.39,56.44Z" fill="#7a1029" />
          </svg>
        </div>
      </div>

      <main className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-6 text-center">
        {/* Hero Headline */}
        <h1 className="max-w-6xl text-5xl font-extrabold tracking-tight text-black dark:text-white sm:text-7xl leading-[1.1]">
          A Space to Build, Track, and Grow.{" "}
          <span className="text-red-600 relative inline-block">
            TelkomAkses
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-red-600 rounded-full opacity-20" />
          </span>
        </h1>
        
        <p className="mt-8 max-w-2xl text-lg font-semibold leading-relaxed text-black-600 dark:text-zinc-400">
          Kelola aktivitas kerja, pantau progres, dan catat kehadiran dalam satu workspace yang sederhana dan terorganisir.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-6 relative z-20">
          <Link 
            href="/dashboard" 
            className="group flex items-center gap-2 rounded-full bg-red-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-red-700 hover:scale-105 hover:shadow-red-600/20 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Masuk Sebagai Admin
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/login"
            className="group flex items-center gap-2 rounded-full bg-red-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-red-700 hover:scale-105 hover:shadow-red-600/20 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Masuk Sebagai Staff
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </main>
    </div>
  );
}
