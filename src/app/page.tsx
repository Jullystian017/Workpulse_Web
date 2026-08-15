import { ArrowRight, Activity, Users, Calendar } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-col items-center justify-center p-6 text-center">
        
        {/* Branding */}
        <div className="mb-8 flex items-center justify-center space-x-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg">
            <Activity className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            TEPA <span className="font-light text-zinc-500">Workspace</span>
          </h1>
        </div>

        {/* Hero Copy */}
        <h2 className="max-w-2xl text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
          Modern Workforce Management for <span className="text-red-600">TelkomAkses</span>
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Start building the UI here. The base Next.js App Router, Tailwind CSS, and Supabase client have been initialized.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Masuk ke Dashboard Admin
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link 
            href="/design-system" 
            className="text-sm font-semibold leading-6 text-zinc-900 transition-colors hover:text-red-600 dark:text-zinc-100 dark:hover:text-red-500"
          >
            View UI Components <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Feature Grid Placeholder */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-4xl w-full">
          {[
            { icon: Users, title: "Employee Hub", desc: "Manage staff, roles, and profiles." },
            { icon: Activity, title: "Performance Tracker", desc: "Monitor daily KPIs and tasks." },
            { icon: Calendar, title: "Smart Scheduling", desc: "AI-assisted shifts and attendance." }
          ].map((feat, i) => (
            <div key={i} className="flex flex-col items-center rounded-2xl bg-white p-6 shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 transition-transform hover:scale-105 cursor-pointer">
              <feat.icon className="h-8 w-8 text-red-600 mb-4" />
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{feat.title}</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 text-center">{feat.desc}</p>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
