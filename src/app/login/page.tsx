"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  EyeIcon,
  EyeOffIcon,
  RefreshCwIcon,
  ActivityIcon,
  ArrowLeftIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = React.useState<"staff" | "admin">("staff");
  const [nik, setNik] = React.useState("10293841");
  const [password, setPassword] = React.useState("••••••••");
  const [showPassword, setShowPassword] = React.useState(false);
  const [captchaInput, setCaptchaInput] = React.useState("");
  const [captchaCode, setCaptchaCode] = React.useState("7K9A2");

  const handleRefreshCaptcha = () => {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let newCode = "";
    for (let i = 0; i < 5; i++) {
      newCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(newCode);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaInput.toUpperCase() !== captchaCode) {
      toast.error("Kode Captcha salah! Silakan coba lagi.");
      handleRefreshCaptcha();
      return;
    }

    toast.success("Login berhasil! Selamat datang di WorkPulse Telkom Akses.");
    if (role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/karyawan/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full bg-white dark:bg-zinc-950">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 xl:px-32 py-12 relative z-10 bg-white dark:bg-zinc-950 min-h-screen">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeftIcon className="size-4" />
            Kembali ke Beranda
          </Link>
        </div>

        <div className="mx-auto flex justify-center mb-6">
          <div className="size-10 rounded-[8px] bg-red-50 dark:bg-red-950/50 flex items-center justify-center border border-red-200/50 dark:border-red-900/40">
            <ActivityIcon className="size-6 text-red-600" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Selamat Datang!
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Silakan masukkan NIK dan detail akun Anda
          </p>

          {/* Role selector tab */}
          <div className="mt-6 inline-flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-[8px] border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setRole("staff")}
              className={`px-5 py-2 text-xs font-semibold rounded-[8px] transition-all ${
                role === "staff"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              👷 Staff / Lapangan
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`px-5 py-2 text-xs font-semibold rounded-[8px] transition-all ${
                role === "admin"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              👑 Admin Overview
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          {/* NIK Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="nik" className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
              NIK / Email
            </label>
            <Input
              id="nik"
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              placeholder="Masukkan NIK Anda"
              required
              className="border-0 border-b border-zinc-300 dark:border-zinc-700 rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-red-600 text-base h-10 font-medium text-zinc-900 dark:text-zinc-100 bg-transparent"
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan Password"
                required
                className="border-0 border-b border-zinc-300 dark:border-zinc-700 rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-red-600 text-base h-10 pr-10 font-medium text-zinc-900 dark:text-zinc-100 bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                {showPassword ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
              </button>
            </div>
          </div>

          {/* Captcha Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="captcha" className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
              Kode Keamanan (Security Code)
            </label>
            <div className="flex gap-4 items-end">
              <Input
                id="captcha"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="Ketik kode"
                required
                className="border-0 border-b border-zinc-300 dark:border-zinc-700 rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-red-600 text-base h-10 font-mono uppercase flex-1 text-zinc-900 dark:text-zinc-100 bg-transparent"
              />
              <div className="flex items-center gap-2 mb-1">
                <div className="select-none tracking-widest font-mono font-bold text-lg text-black bg-zinc-100 px-4 py-1.5 rounded-[8px] border border-zinc-200">
                  {captchaCode}
                </div>
                <button
                  type="button"
                  onClick={handleRefreshCaptcha}
                  className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  title="Ganti Captcha"
                >
                  <RefreshCwIcon className="size-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-red-600 focus:ring-red-500 accent-red-600 cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-xs sm:text-sm font-medium leading-none cursor-pointer text-zinc-600 dark:text-zinc-400"
              >
                Ingat saya
              </label>
            </div>
            <a
              href="#"
              className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              Lupa password?
            </a>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col gap-3 mt-4">
            <Button
              type="submit"
              className="w-full h-12 rounded-full text-base font-bold bg-red-600 hover:bg-red-700 text-white transition-all shadow-md hover:shadow-lg hover:scale-[1.01]"
            >
              Masuk Sekarang
            </Button>
          </div>
        </form>
      </div>

      {/* Right Side - Image / Illustration */}
      <div className="hidden lg:flex w-1/2 relative bg-zinc-900 min-h-screen">
        <img
          src="https://www.telkom.co.id/minio/show/data/image_upload/news/1786102050428_original_Foto-2-10.webp"
          alt="Telkom Indonesia"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12 text-white">
          <span className="text-xs font-bold uppercase tracking-wider text-red-400">
            WorkPulse Telkom Akses
          </span>
          <h2 className="text-2xl font-bold mt-2">
            Terhubung, Terintegrasi, dan Terpercaya
          </h2>
          <p className="text-sm text-zinc-300 mt-2 max-w-md">
            Mendukung efisiensi operasional dan manajemen tenaga kerja lapangan Telkom Akses dengan teknologi terkini.
          </p>
        </div>
      </div>
    </div>
  );
}
