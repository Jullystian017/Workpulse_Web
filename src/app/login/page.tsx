"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  EyeIcon,
  EyeOffIcon,
  RefreshCwIcon,
  ActivityIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const router = useRouter()
  const [nik, setNik] = React.useState("10293841")
  const [password, setPassword] = React.useState("••••••••")
  const [showPassword, setShowPassword] = React.useState(false)
  const [captchaInput, setCaptchaInput] = React.useState("")
  const [captchaCode, setCaptchaCode] = React.useState("7K9A2")

  const handleRefreshCaptcha = () => {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
    let newCode = ""
    for (let i = 0; i < 5; i++) {
      newCode += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCaptchaCode(newCode)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (captchaInput.toUpperCase() !== captchaCode) {
      toast.error("Kode Captcha salah! Silakan coba lagi.")
      handleRefreshCaptcha()
      return
    }

    toast.success("Login berhasil! Selamat datang di WorkPulse Telkom Akses.")
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full bg-white">
        
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 xl:px-32 py-12 relative z-10 bg-white min-h-screen">
          
          <div className="mx-auto flex justify-center mb-6">
            <div className="size-8">
               {/* Abstract logo icon similar to screenshot */}
               <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path d="M12 2L12 22M2 12L22 12" stroke="black" strokeWidth="4" strokeLinecap="round"/>
                  <path d="M12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6Z" fill="black"/>
               </svg>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Welcome back!</h1>
            <p className="text-sm text-zinc-500 mt-2">Please enter your details</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            
            {/* NIK Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="nik" className="text-sm font-medium text-zinc-900">
                NIK / Email
              </label>
              <Input
                id="nik"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                placeholder="Masukkan NIK"
                required
                className="border-0 border-b border-zinc-300 rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-black text-base h-10 font-medium text-zinc-900 bg-transparent"
              />
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-zinc-900">
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
                  className="border-0 border-b border-zinc-300 rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-black text-base h-10 pr-10 font-medium text-zinc-900 bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900"
                >
                  {showPassword ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
                </button>
              </div>
            </div>

            {/* Captcha Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="captcha" className="text-sm font-medium text-zinc-900">
                Security Code
              </label>
              <div className="flex gap-4 items-end">
                <Input
                  id="captcha"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Enter code"
                  required
                  className="border-0 border-b border-zinc-300 rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-black text-base h-10 font-mono uppercase flex-1 text-zinc-900 bg-transparent"
                />
                <div className="flex items-center gap-2 mb-1">
                  <div className="select-none tracking-widest font-mono font-bold text-lg text-black bg-zinc-100 px-4 py-1.5 rounded-lg border border-zinc-200">
                    {captchaCode}
                  </div>
                  <button
                    type="button"
                    onClick={handleRefreshCaptcha}
                    className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors"
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
                  className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black accent-black cursor-pointer" 
                />
                <label
                  htmlFor="remember"
                  className="text-xs sm:text-sm font-medium leading-none cursor-pointer text-zinc-600"
                >
                  Remember for 30 days
                </label>
              </div>
              <a href="#" className="text-xs sm:text-sm font-medium text-zinc-600 hover:text-black transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col gap-3 mt-4">
               <Button type="submit" className="w-full h-12 rounded-full text-base font-bold bg-red-600 hover:bg-red-700 text-white transition-all shadow-md">
                 Log In
               </Button>
            </div>
            
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500">
            Don't have an account?{" "}
            <a href="/signup" className="font-semibold text-black hover:underline">
              Sign Up
            </a>
          </p>
        </div>

        {/* Right Side - Image/Illustration */}
        <div className="hidden lg:flex w-1/2 relative bg-zinc-900 min-h-screen">
          <img 
            src="https://www.telkom.co.id/minio/show/data/image_upload/news/1786102050428_original_Foto-2-10.webp"
            alt="Telkom Indonesia"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

    </div>
  )
}
