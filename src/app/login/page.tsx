"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  EyeIcon,
  EyeOffIcon,
  RefreshCwIcon,
  ActivityIcon,
  LockIcon,
  KeyRoundIcon,
  MailIcon,
  PhoneIcon,
  HeadphonesIcon,
  AlertTriangleIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  ZapIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { loginWithEmail, setActiveUser, verifyAndResetPassword } from "@/lib/api";
import { recordActivity } from "@/lib/activity-logger";
import { ROLE_LABELS } from "@/types/database";

const REMEMBERED_EMAIL_KEY = "workpulse_remembered_email";
const FAILED_ATTEMPTS_KEY = "workpulse_login_failed_attempts";
const LOCKOUT_EXPIRY_KEY = "workpulse_lockout_expiry";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);

  // Adaptive Security & Rate Limiting State
  const [failedAttempts, setFailedAttempts] = React.useState(0);
  const [lockoutRemaining, setLockoutRemaining] = React.useState(0);
  const [captchaInput, setCaptchaInput] = React.useState("");
  const [captchaCode, setCaptchaCode] = React.useState("7K9A2");
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // Forgot Password Dialog State
  const [isForgotOpen, setIsForgotOpen] = React.useState(false);
  const [forgotTab, setForgotTab] = React.useState<"reset" | "helpdesk">("reset");
  const [forgotEmail, setForgotEmail] = React.useState("");
  const [forgotNik, setForgotNik] = React.useState("");
  const [newResetPassword, setNewResetPassword] = React.useState("");
  const [confirmResetPassword, setConfirmResetPassword] = React.useState("");
  const [showResetPassword, setShowResetPassword] = React.useState(false);
  const [isResetSubmitting, setIsResetSubmitting] = React.useState(false);

  // Show CAPTCHA only adaptively after 3 failed login attempts
  const requiresCaptcha = failedAttempts >= 3;
  const isLockedOut = lockoutRemaining > 0;

  // Draw distorted canvas CAPTCHA with noise & interference lines
  const drawCaptcha = React.useCallback((code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "#f4f4f5");
    grad.addColorStop(1, "#e4e4e7");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Random Background Noise Dots
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = ["#ef4444", "#a1a1aa", "#71717a", "#dc2626"][Math.floor(Math.random() * 4)];
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Interference Lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = ["#fca5a5", "#f87171", "#d4d4d8"][Math.floor(Math.random() * 3)];
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.bezierCurveTo(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * canvas.width,
        Math.random() * canvas.height
      );
      ctx.stroke();
    }

    // Draw Characters with angle distortion & custom offsets
    const chars = code.split("");
    const charWidth = canvas.width / (chars.length + 1);

    chars.forEach((char, i) => {
      ctx.save();
      const x = (i + 0.8) * charWidth;
      const y = canvas.height / 2 + (Math.random() * 8 - 4);
      const angle = (Math.random() * 30 - 15) * (Math.PI / 180);

      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.font = `bold ${22 + Math.floor(Math.random() * 4)}px monospace`;
      ctx.fillStyle = ["#b91c1c", "#991b1b", "#7f1d1d", "#dc2626"][i % 4];
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(char, 0, 0);

      ctx.restore();
    });
  }, []);

  const handleRefreshCaptcha = React.useCallback(() => {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let newCode = "";
    for (let i = 0; i < 5; i++) {
      newCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(newCode);
    setCaptchaInput("");
    setTimeout(() => {
      drawCaptcha(newCode);
    }, 50);
  }, [drawCaptcha]);

  // Initialize on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }

      const storedAttempts = parseInt(sessionStorage.getItem(FAILED_ATTEMPTS_KEY) || "0", 10);
      if (!isNaN(storedAttempts)) {
        setFailedAttempts(storedAttempts);
      }

      const storedExpiry = parseInt(sessionStorage.getItem(LOCKOUT_EXPIRY_KEY) || "0", 10);
      const now = Date.now();
      if (storedExpiry && storedExpiry > now) {
        setLockoutRemaining(Math.ceil((storedExpiry - now) / 1000));
      }
    }
  }, []);

  // Cooldown countdown effect
  React.useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          sessionStorage.removeItem(LOCKOUT_EXPIRY_KEY);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  // Re-draw CAPTCHA whenever it is required
  React.useEffect(() => {
    if (requiresCaptcha) {
      handleRefreshCaptcha();
    }
  }, [requiresCaptcha, handleRefreshCaptcha]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) {
      toast.error(`Akses ditangguhkan sementara demi keamanan. Tunggu ${lockoutRemaining} detik lagi.`);
      return;
    }
    if (!email.trim()) {
      toast.error("Silakan masukkan alamat email Anda.");
      return;
    }
    if (!password) {
      toast.error("Silakan masukkan password akun Anda.");
      return;
    }

    // Adaptive CAPTCHA Verification only when triggered
    if (requiresCaptcha) {
      if (!captchaInput.trim()) {
        toast.error("Silakan masukkan kode CAPTCHA di samping.");
        return;
      }
      if (captchaInput.toUpperCase() !== captchaCode) {
        toast.error("Kode keamanan CAPTCHA salah! Silakan coba lagi.");
        handleRefreshCaptcha();
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await loginWithEmail(email.trim(), password);

      if (!res.success || !res.user) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(FAILED_ATTEMPTS_KEY, nextAttempts.toString());
        }

        if (nextAttempts >= 5) {
          // Trigger 30s lockout
          const expiry = Date.now() + 30000;
          sessionStorage.setItem(LOCKOUT_EXPIRY_KEY, expiry.toString());
          setLockoutRemaining(30);
          toast.error("Terdeteksi 5 kali kegagalan login. Sistem mengunci percobaan login selama 30 detik demi keamanan.");
          recordActivity({
            user: `Percobaan Email: ${email.trim()}`,
            action: "SECURITY_LOCKOUT",
            module: "Security & System",
            level: "ERROR",
            detail: "Proteksi brute-force terpicu: 5x login gagal. Akses percobaan login ditangguhkan sementara 30 detik.",
          });
        } else if (nextAttempts === 3) {
          toast.warning("Terdeteksi 3 kali kegagalan login. Verifikasi keamanan anti-bot (CAPTCHA) diaktifkan.");
          handleRefreshCaptcha();
          recordActivity({
            user: `Percobaan Email: ${email.trim()}`,
            action: "CAPTCHA_TRIGGERED",
            module: "Security & System",
            level: "WARNING",
            detail: "Verifikasi anti-bot CAPTCHA diaktifkan setelah 3 kali kegagalan autentikasi berturut-turut.",
          });
        } else {
          toast.error(res.message || "Email atau Password tidak sesuai.", {
            description: `Percobaan gagal ${nextAttempts}/3 sebelum proteksi bot diaktifkan.`,
          });
          recordActivity({
            user: email ? `Percobaan Email: ${email.trim()}` : "Anonim",
            action: "LOGIN_FAILED",
            module: "Authentication",
            level: "WARNING",
            detail: `Percobaan login gagal (${nextAttempts}/5): ${res.message || "Kredensial tidak sesuai"}.`,
          });
        }
        setIsLoading(false);
        return;
      }

      // Success Login
      const user = res.user;
      setFailedAttempts(0);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(FAILED_ATTEMPTS_KEY);
        sessionStorage.removeItem(LOCKOUT_EXPIRY_KEY);
        if (rememberMe) {
          localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
        } else {
          localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }
      }

      recordActivity({
        user: `${user.nama} (${user.nik})`,
        user_id: user.id,
        action: "LOGIN_SUCCESS",
        module: "Authentication",
        level: "INFO",
        detail: `Pengguna berhasil login ke portal WorkPulse sebagai ${user.position_title || ROLE_LABELS[user.role]?.badge || user.role}.`,
      });

      setActiveUser(user);
      toast.success(`Selamat datang kembali, ${user.nama}!`, {
        description: `Login sebagai ${ROLE_LABELS[user.role]?.label || user.position_title}`,
      });

      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/karyawan/dashboard");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kendala saat menghubungkan ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Self-Service Password Reset
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error("Email resmi wajib diisi.");
      return;
    }
    if (!forgotNik.trim()) {
      toast.error("NIK wajib diisi untuk verifikasi identitas.");
      return;
    }
    if (!newResetPassword || newResetPassword.length < 6) {
      toast.error("Password baru minimal 6 karakter.");
      return;
    }
    if (newResetPassword !== confirmResetPassword) {
      toast.error("Konfirmasi password tidak cocok!");
      return;
    }

    setIsResetSubmitting(true);
    try {
      const res = await verifyAndResetPassword(
        forgotNik.trim(),
        forgotEmail.trim(),
        newResetPassword
      );

      if (res.success) {
        recordActivity({
          user: `${res.user?.nama || forgotEmail.trim()} (NIK: ${forgotNik.trim()})`,
          user_id: res.user?.id,
          action: "PASSWORD_RESET",
          module: "Authentication",
          level: "AUDIT",
          detail: `Pengguna berhasil melakukan reset password mandiri via email ${forgotEmail.trim()}.`,
        });

        toast.success(res.message);
        setEmail(forgotEmail.trim());
        setPassword(newResetPassword);
        setIsForgotOpen(false);
        setForgotEmail("");
        setForgotNik("");
        setNewResetPassword("");
        setConfirmResetPassword("");
      } else {
        recordActivity({
          user: `Percobaan Reset Email: ${forgotEmail.trim()}`,
          action: "PASSWORD_RESET_FAILED",
          module: "Authentication",
          level: "WARNING",
          detail: `Gagal verifikasi reset password: ${res.message}`,
        });
        toast.error(res.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal mereset password. Pastikan Email dan NIK sesuai.");
    } finally {
      setIsResetSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f5f7] dark:bg-zinc-950 p-3 sm:p-5 lg:p-7 xl:p-8 flex items-center justify-center font-sans">
      {/* Outer Unified Window Card (Matches Reference Image) */}
      <div className="w-full max-w-[1240px] bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200/90 dark:border-zinc-800 shadow-2xl p-3 sm:p-4 lg:p-5 flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-[640px] lg:min-h-[720px] overflow-hidden">
        {/* Left Side: Authentication Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12 bg-white dark:bg-zinc-900 rounded-[24px]">
          <div>
            {/* Header Branding */}
            <div className="flex items-center gap-2.5 mb-6">
              <div className="size-8 rounded-lg bg-white dark:bg-zinc-800 p-1 flex items-center justify-center shadow-xs border border-zinc-200/80 dark:border-zinc-700/80 shrink-0">
                <Image
                  src="/workpulse.png"
                  alt="WorkPulse Logo"
                  width={24}
                  height={24}
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">
                WorkPulse
              </span>
            </div>
          </div>

          <div className="max-w-md w-full mx-auto my-auto py-2">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                Masuk ke Akun Anda
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
                Gunakan email korporat Telkom Akses yang telah didaftarkan oleh Administrator HR untuk masuk.
              </p>
            </div>

          {/* Adaptive Security Alert (Appears only on suspicious failures) */}
          {isLockedOut ? (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3">
              <ShieldAlertIcon className="size-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-red-800 dark:text-red-300 block">
                  Proteksi Brute-Force Aktif
                </span>
                <p className="text-red-700 dark:text-red-400 mt-0.5">
                  Terlalu banyak percobaan gagal. Tombol login dikunci sementara. Mohon tunggu{" "}
                  <span className="font-mono font-bold text-red-900 dark:text-red-200">{lockoutRemaining} detik</span>.
                </p>
              </div>
            </div>
          ) : requiresCaptcha ? (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
              <AlertTriangleIcon className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-amber-800 dark:text-amber-300 block">
                  Verifikasi Keamanan Tambahan Diaktifkan ({failedAttempts}x Gagal)
                </span>
                <p className="text-amber-700 dark:text-amber-400 mt-0.5">
                  Untuk mencegah percobaan tak sah, silakan masukkan kode CAPTCHA di bawah sebelum masuk.
                </p>
              </div>
            </div>
          ) : null}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Email
              </label>
              <div className="relative mt-1.5">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@telkomakses.co.id atau email terdaftar"
                  required
                  disabled={isLockedOut || isLoading}
                  autoComplete="email"
                  className="h-11 rounded-[8px] bg-zinc-50 dark:bg-zinc-800/80 border-zinc-300 dark:border-zinc-700 text-sm font-semibold text-zinc-900 dark:text-zinc-100 pl-10"
                />
                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setIsForgotOpen(true);
                  }}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 transition-colors cursor-pointer"
                >
                  Lupa Password?
                </button>
              </div>
              <div className="relative mt-1.5">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password akun"
                  required
                  disabled={isLockedOut || isLoading}
                  className="h-11 rounded-[8px] bg-zinc-50 dark:bg-zinc-800/80 border-zinc-300 dark:border-zinc-700 text-sm font-semibold pr-11 text-zinc-900 dark:text-zinc-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
            </div>

            {/* Dynamic Pixelated Canvas CAPTCHA (Only shown when suspicious >= 3 failures) */}
            {requiresCaptcha && (
              <div className="p-3 rounded-[5px] bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                  <span>Kode Keamanan CAPTCHA *</span>
                  <span className="text-[11px] font-normal text-amber-600 dark:text-amber-400">Wajib diisi</span>
                </label>
                <div className="flex items-center gap-2.5">
                  <Input
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Ketik kode di samping"
                    required
                    disabled={isLockedOut || isLoading}
                    className="h-11 rounded-[8px] bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-sm font-mono uppercase tracking-widest font-bold flex-1 text-zinc-900 dark:text-zinc-100"
                  />
                  <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-2 h-11 rounded-[8px] select-none">
                    <canvas
                      ref={canvasRef}
                      width={120}
                      height={36}
                      className="rounded-lg shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={handleRefreshCaptcha}
                      className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                      title="Ganti Kode Keamanan"
                    >
                      <RefreshCwIcon className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-4 rounded border-zinc-300 text-red-600 focus:ring-red-500 accent-red-600 cursor-pointer"
                />
                <span>Ingat Email di Perangkat Ini</span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading || isLockedOut}
              className="w-full h-11 rounded-[8px] text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition-all shadow-md hover:shadow-lg mt-2 gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCwIcon className="size-4 animate-spin" />
                  Memproses Autentikasi...
                </>
              ) : isLockedOut ? (
                <>
                  <LockIcon className="size-4" />
                  Terkunci Sementara ({lockoutRemaining}s)
                </>
              ) : (
                <>
                  Masuk
                </>
              )}
            </Button>
          </form>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-2 mt-4">
            <span>© 2026 WorkPulse Telkom Akses. All rights reserved.</span>
          </div>
        </div>

        {/* Right Side: Interactive Showcase Card (Framed inside the window card) */}
        <div className="hidden lg:flex lg:w-1/2 rounded-[24px] border border-red-500/20 bg-gradient-to-br from-[#c91d25] via-[#a3151c] to-[#450a0a] relative overflow-hidden flex-col justify-between items-center p-6 xl:p-8 shadow-inner select-none">
          {/* Architectural Subtle Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />

          {/* Ambient Warm Radial Glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[360px] bg-white/10 rounded-full blur-[90px] pointer-events-none" />

          {/* Top: Compact Floating Mockup Cards Cluster */}
          <div className="relative w-full max-w-[380px] xl:max-w-[410px] h-[330px] my-auto">
            {/* Card 1: Top-Left (SLA Compliance Donut) */}
            <div className="absolute top-0 left-0 w-[215px] xl:w-[230px] rounded-xl bg-white text-zinc-900 p-3 xl:p-3.5 shadow-[0_15px_35px_rgba(0,0,0,0.35)] border border-white/80 z-10 transform -rotate-1 hover:rotate-0 transition-transform duration-300 pointer-events-none">
              <div className="flex items-center justify-between text-[11px] font-bold text-zinc-800 mb-2">
                <span>Kepatuhan SLA</span>
                <span className="text-[9px] text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded-full font-medium">Bulan Ini ▾</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative size-12 shrink-0 flex items-center justify-center">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9155" className="text-zinc-100" strokeWidth="4" stroke="currentColor" fill="none" />
                    <circle cx="18" cy="18" r="15.9155" className="text-red-600" strokeWidth="4" strokeDasharray="72, 100" strokeDashoffset="0" stroke="currentColor" fill="none" />
                    <circle cx="18" cy="18" r="15.9155" className="text-amber-500" strokeWidth="4" strokeDasharray="16, 100" strokeDashoffset="-72" stroke="currentColor" fill="none" />
                    <circle cx="18" cy="18" r="15.9155" className="text-zinc-400" strokeWidth="4" strokeDasharray="12, 100" strokeDashoffset="-88" stroke="currentColor" fill="none" />
                  </svg>
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="text-sm font-extrabold text-zinc-900 leading-tight">94.8%</div>
                  <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Tercapai</div>
                  <div className="pt-0.5 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[9px] text-zinc-600 font-medium">
                      <span className="size-1.5 rounded-full bg-red-600 shrink-0" />
                      <span className="truncate">Tepat Waktu</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-zinc-600 font-medium">
                      <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span className="truncate">Berjalan</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-zinc-100">
                <div className="text-[9px] font-semibold text-zinc-400 mb-1">Target Wilayah</div>
                <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                  <div>
                    <div className="flex justify-between text-zinc-600 mb-0.5">
                      <span>Witel BDG</span>
                      <span className="font-bold text-zinc-900">96%</span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-1">
                      <div className="bg-red-600 h-1 rounded-full w-[96%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-zinc-600 mb-0.5">
                      <span>Witel CRB</span>
                      <span className="font-bold text-zinc-900">89%</span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-1">
                      <div className="bg-amber-500 h-1 rounded-full w-[89%]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-2.5">
                <div className="w-full py-1 rounded-lg bg-zinc-900 text-white text-center text-[9px] font-semibold tracking-wide hover:bg-zinc-800 transition-colors shadow-xs">
                  Eksplorasi SLA
                </div>
              </div>
            </div>

            {/* Card 2: Top-Right (Target & Realisasi SPJ) */}
            <div className="absolute top-2 right-0 w-[205px] xl:w-[220px] rounded-xl bg-white text-zinc-900 p-3 xl:p-3.5 shadow-[0_12px_30px_rgba(0,0,0,0.25)] border border-white/70 z-0 transform rotate-2 hover:rotate-0 transition-transform duration-300 pointer-events-none">
              <div className="flex items-center justify-between text-[11px] font-bold text-zinc-800 mb-2">
                <span>Target & Realisasi</span>
                <span className="text-[9px] font-mono text-zinc-400">Q3 2026</span>
              </div>

              <div className="space-y-2.5">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold text-zinc-900">Modernisasi FO</div>
                  <div className="flex items-baseline justify-between text-[9px]">
                    <span className="font-extrabold text-zinc-900 font-mono">42 / 48 Site</span>
                    <span className="font-bold text-red-600">88%</span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-full h-1 overflow-hidden">
                    <div className="bg-red-600 h-1 rounded-full w-[88%]" />
                  </div>
                </div>

                <div className="space-y-0.5 pt-1.5 border-t border-zinc-100">
                  <div className="text-[10px] font-bold text-zinc-900">Pagu Anggaran SPJ</div>
                  <div className="flex items-baseline justify-between text-[9px]">
                    <span className="font-extrabold text-zinc-900 font-mono">Rp 32,4jt / 40jt</span>
                    <span className="font-bold text-amber-600">81%</span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-full h-1 overflow-hidden">
                    <div className="bg-amber-500 h-1 rounded-full w-[81%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Front-Center / Bottom-Left (Penugasan Prioritas) */}
            <div className="absolute top-[115px] left-3 xl:left-5 w-[235px] xl:w-[250px] rounded-xl bg-white text-zinc-900 p-3 xl:p-3.5 shadow-[0_20px_45px_rgba(0,0,0,0.45)] border border-white/90 z-20 pointer-events-none">
              <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-zinc-100">
                <span className="font-bold text-zinc-900">Penugasan Prioritas</span>
                <span className="flex items-center gap-1 text-[9px] text-emerald-600 font-medium">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>

              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <div className="text-[9px] text-zinc-400 font-medium">Tugas Aktif</div>
                  <div className="text-base font-black text-zinc-900 tracking-tight">28 Tiket</div>
                </div>
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                  ↑ 14.8% SLA
                </span>
              </div>

              <div className="mt-2 space-y-1.5">
                <div className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="size-6 rounded-md bg-red-100 text-red-600 flex items-center justify-center font-bold text-[10px]">
                      <ActivityIcon className="size-3" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-zinc-900 truncate max-w-[100px]">Maintenance OLT</div>
                      <div className="text-[8.5px] text-zinc-400">Tim Bravo · BDG</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-zinc-900 font-mono">98%</div>
                    <div className="text-[8.5px] font-bold text-emerald-600">+3.8%</div>
                  </div>
                </div>

                <div className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="size-6 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-[10px]">
                      <ZapIcon className="size-3" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-zinc-900 truncate max-w-[100px]">Instalasi Node-B</div>
                      <div className="text-[8.5px] text-zinc-400">Tim Delta · 4 Site</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-zinc-900 font-mono">75%</div>
                    <div className="text-[8.5px] font-bold text-emerald-600">+2.5%</div>
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <div className="w-full py-1 rounded-lg bg-zinc-900 text-white text-center text-[9px] font-semibold tracking-wide hover:bg-zinc-800 transition-colors shadow-xs">
                  Pantau Penugasan
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: App Icon Badge + Headline + Subtitle (Concise) */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-sm mx-auto space-y-2 pb-1">
            {/* Logo Badge */}
            <div className="size-13 rounded-2xl bg-white p-2 flex items-center justify-center shadow-xl shadow-black/40 ring-4 ring-white/10">
              <Image
                src="/workpulse.png"
                alt="WorkPulse Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>

            <h2 className="text-lg xl:text-xl font-extrabold tracking-tight text-white leading-tight">
              Pusat Manajemen Tugas Cerdas
            </h2>

            <p className="text-xs text-red-100/90 leading-relaxed max-w-xs font-medium">
              Pantau performa SLA, alur kerja tim, dan realisasi SPJ Telkom Akses secara terpadu dan transparan.
            </p>
          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* DIALOG LUPA PASSWORD (SELF-SERVICE RESET & HELPDESK)       */}
      {/* ======================================================== */}
      <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6 font-sans">
          <DialogHeader>
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
              <KeyRoundIcon className="size-4" />
              <span>Pemulihan Akun Karyawan</span>
            </div>
            <DialogTitle className="text-xl font-extrabold text-foreground">
              Lupa Password Akun
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Reset password mandiri melalui verifikasi email resmi Telkom Akses atau hubungi IT Support.
            </DialogDescription>
          </DialogHeader>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-muted/60 rounded-xl border border-border mt-3">
            <button
              type="button"
              onClick={() => setForgotTab("reset")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${forgotTab === "reset"
                ? "bg-white dark:bg-zinc-800 text-foreground shadow-xs"
                : "text-muted-foreground"
                }`}
            >
              Reset Mandiri
            </button>
            <button
              type="button"
              onClick={() => setForgotTab("helpdesk")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${forgotTab === "helpdesk"
                ? "bg-white dark:bg-zinc-800 text-foreground shadow-xs"
                : "text-muted-foreground"
                }`}
            >
              Kontak IT Helpdesk
            </button>
          </div>

          {forgotTab === "reset" ? (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5 mt-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Email Korporat (untuk verifikasi) *
                </label>
                <Input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="nama.lengkap@telkomakses.co.id"
                  required
                  className="mt-1 h-10 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  NIK (verifikasi tambahan) *
                </label>
                <Input
                  value={forgotNik}
                  onChange={(e) => setForgotNik(e.target.value)}
                  placeholder="Contoh: 10293841"
                  required
                  className="mt-1 h-10 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Password Baru *
                  </label>
                  <div className="relative mt-1">
                    <Input
                      type={showResetPassword ? "text" : "password"}
                      value={newResetPassword}
                      onChange={(e) => setNewResetPassword(e.target.value)}
                      placeholder="Min. 6 karakter"
                      required
                      className="h-10 rounded-xl text-xs pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground p-1"
                    >
                      {showResetPassword ? <EyeOffIcon className="size-3.5" /> : <EyeIcon className="size-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Konfirmasi Password *
                  </label>
                  <Input
                    type="password"
                    value={confirmResetPassword}
                    onChange={(e) => setConfirmResetPassword(e.target.value)}
                    placeholder="Ulangi password"
                    required
                    className="mt-1 h-10 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsForgotOpen(false)}
                  className="h-9 text-xs rounded-xl"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isResetSubmitting}
                  className="h-9 px-5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs"
                >
                  {isResetSubmitting ? "Memverifikasi..." : "Reset Password Akun"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 mt-3">
              <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <HeadphonesIcon className="size-4 text-red-600" />
                  <span>IT Helpdesk & System Support Telkom Akses</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Jika email korporat Anda tidak dapat diakses, silakan hubungi Administrator HR / IT Support untuk permohonan reset password instan:
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border">
                  <PhoneIcon className="size-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-foreground block">Hotline IT Regional III</span>
                    <span className="text-muted-foreground font-mono">(022) 4521-9999 • Ext. 402</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border">
                  <MailIcon className="size-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-bold text-foreground block">Email Helpdesk Resmi</span>
                    <span className="text-muted-foreground font-mono">helpdesk@telkomakses.co.id</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-border mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsForgotOpen(false)}
                  className="h-9 text-xs rounded-xl"
                >
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
