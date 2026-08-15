import { ArrowRight, Activity, Users, Calendar } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-white dark:bg-zinc-950 overflow-hidden selection:bg-red-500/30">
      {/* Background decorations */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex flex-col justify-between">
        {/* Top ambient glow */}
        <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[150%] sm:w-[100%] aspect-[1/0.5] rounded-[100%] bg-gradient-to-b from-red-100 via-white to-transparent dark:from-red-950/20 dark:via-zinc-950 dark:to-transparent blur-3xl opacity-60" />
        
        {/* Dark Red Waves (Dunes) behind the laptop */}
        <div className="absolute bottom-[10%] sm:bottom-[5%] left-0 right-0 w-full h-[300px] sm:h-[400px] opacity-90 [mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)]">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg">
            {/* Back Wave */}
            <path d="M0,24C164,68,264,124,472,108,704,90,832,24,1064,24c52,0,102.4,8.8,136,21.6V120H0Z" fill="#38050e" />
            {/* Middle Wave */}
            <path d="M0,75.2C118.4,124.8,291.6,152,500,104,746,47.2,886.8,19.2,1093.6,56,1151.2,66.4,1184.4,76,1200,81.6V120H0Z" fill="#580816" opacity="0.9" />
            {/* Front Wave */}
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C52.16,93.42,103.88,86.2,154.5,77.58,211.23,67.92,267.47,66.69,321.39,56.44Z" fill="#7a1029" opacity="0.95" />
          </svg>
        </div>
      </div>

      <main className="relative z-10 flex w-full flex-col items-center justify-start pt-20 px-6 text-center">
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
            href="/design-system"
            className="group flex items-center gap-2 rounded-full bg-red-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-red-700 hover:scale-105 hover:shadow-red-600/20 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Masuk Sebagai Staff
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Laptop Mockup */}
        <div className="mt-20 w-full max-w-[900px] mx-auto relative group perspective-[1200px] z-10 px-4 sm:px-8">
           {/* Decorative glow behind laptop */}
           <div className="absolute -inset-10 rounded-[3rem] bg-red-600/20 blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
           
           {/* Laptop Lid / Screen Base */}
           <div className="relative rounded-t-2xl sm:rounded-t-3xl bg-zinc-800 p-2 sm:p-3 shadow-2xl ring-1 ring-zinc-900/40 transition-all duration-700 ease-out transform group-hover:rotate-x-[2deg] group-hover:-translate-y-2">
             
             {/* Camera dot */}
             <div className="absolute top-1.5 sm:top-2 left-1/2 w-1.5 h-1.5 -translate-x-1/2 rounded-full bg-black z-20"></div>
             
             {/* Screen */}
             <div className="relative aspect-[16/10] rounded-xl sm:rounded-2xl bg-zinc-950 overflow-hidden flex flex-col border border-zinc-900 shadow-inner">
                
                {/* App Header (Dashboard like) */}
                <div className="h-10 sm:h-12 border-b border-zinc-800/80 bg-zinc-900/50 flex items-center px-4 gap-4 z-10">
                   <div className="flex gap-1.5">
                     <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/80 hover:bg-red-500 transition-colors"></div>
                     <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/80 hover:bg-yellow-500 transition-colors"></div>
                     <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/80 hover:bg-green-500 transition-colors"></div>
                   </div>
                   <div className="text-white/90 text-xs sm:text-sm font-semibold tracking-wide flex items-center gap-2 mx-auto pr-8">
                      <Activity className="w-4 h-4 text-red-500" />
                      TEPA Dashboard
                   </div>
                </div>

                {/* App Content */}
                <div className="flex-1 flex px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6 relative z-0 gap-4 sm:gap-6">
                   {/* Sidebar skeleton */}
                   <div className="hidden sm:flex w-1/4 h-full flex-col gap-3">
                     <div className="h-8 w-full rounded-md bg-red-600/20 border border-red-500/30 flex items-center px-3 gap-2">
                        <Users className="w-4 h-4 text-red-500" />
                        <div className="h-2 w-16 bg-red-500/50 rounded-full"></div>
                     </div>
                     <div className="h-8 w-full rounded-md bg-zinc-800/40 flex items-center px-3 gap-2">
                        <Activity className="w-4 h-4 text-zinc-500" />
                        <div className="h-2 w-20 bg-zinc-600/50 rounded-full"></div>
                     </div>
                     <div className="h-8 w-full rounded-md bg-zinc-800/40 flex items-center px-3 gap-2">
                        <Calendar className="w-4 h-4 text-zinc-500" />
                        <div className="h-2 w-14 bg-zinc-600/50 rounded-full"></div>
                     </div>
                   </div>

                   {/* Main Content Area */}
                   <div className="flex-1 h-full flex flex-col gap-4">
                     <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 sm:p-5 text-left shadow-lg backdrop-blur-sm">
                       <h2 className="text-zinc-200 text-base sm:text-lg font-medium leading-relaxed">
                         Track workforce metrics in real-time
                       </h2>
                       <p className="text-zinc-400 text-xs sm:text-sm mt-1">Monitor shifts, daily tasks, and performance trends.</p>
                     </div>

                     {/* Chart / Interactive Area */}
                     <div className="flex-1 bg-zinc-900/30 rounded-xl border border-zinc-800/50 relative overflow-hidden flex flex-col p-4 group/screen">
                        
                        {/* Animated chart line */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-60 group-hover/screen:opacity-100 transition-opacity duration-1000 p-4 sm:p-8">
                           <svg viewBox="0 0 200 60" className="w-full h-full stroke-red-500 stroke-[2] fill-none drop-shadow-[0_0_8px_rgba(220,38,38,0.6)]">
                              <path d="M0 40 Q 20 20 40 35 T 80 20 T 120 45 T 160 15 T 200 30" className="animate-[pulse_3s_ease-in-out_infinite]" />
                           </svg>
                        </div>
                     </div>
                   </div>
                </div>
             </div>
           </div>
           
           {/* Laptop Base */}
           <div className="relative h-3 sm:h-5 w-[104%] -left-[2%] bg-zinc-300 dark:bg-zinc-800 rounded-b-xl sm:rounded-b-2xl shadow-[0_15px_30px_rgba(0,0,0,0.5)] transition-all duration-700 ease-out transform group-hover:rotate-x-[2deg] group-hover:-translate-y-2 flex justify-center z-20 border-t border-zinc-400 dark:border-zinc-600">
             <div className="w-16 sm:w-24 h-1.5 sm:h-2 bg-zinc-400 dark:bg-zinc-900 rounded-b-md"></div>
           </div>
        </div>
      </main>
    </div>
  );
}
