"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  EyeIcon,
  EyeOffIcon,
  RefreshCwIcon,
  ActivityIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  LockIcon,
  CheckCircle2Icon,
  KeyRoundIcon,
  MailIcon,
  PhoneIcon,
  HeadphonesIcon,
  AlertTriangleIcon,
  ShieldAlertIcon,
  SparklesIcon,
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
import { loginWithCredentials, setActiveUser, verifyAndResetPassword } from "@/lib/api";
import { ROLE_LABELS, UserRole } from "@/types/database";

const REMEMBERED_NIK_KEY = "workpulse_remembered_nik";
const FAILED_ATTEMPTS_KEY = "workpulse_login_failed_attempts";
const LOCKOUT_EXPIRY_KEY = "workpulse_lockout_expiry";

export default function LoginPage() {
  const router = useRouter();
  const [nik, setNik] = React.useState("");
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
  const [forgotNik, setForgotNik] = React.useState("");
  const [forgotEmail, setForgotEmail] = React.useState("");
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
      const savedNik = localStorage.getItem(REMEMBERED_NIK_KEY);
      if (savedNik) {
        setNik(savedNik);
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
    if (!nik.trim()) {
      toast.error("Silakan masukkan NIK Anda.");
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
      const res = await loginWithCredentials(nik.trim(), password);

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
        } else if (nextAttempts === 3) {
          toast.warning("Terdeteksi 3 kali kegagalan login. Verifikasi keamanan anti-bot (CAPTCHA) diaktifkan.");
          handleRefreshCaptcha();
        } else {
          toast.error(res.message || "NIK atau Password tidak sesuai.", {
            description: `Percobaan gagal ${nextAttempts}/3 sebelum proteksi bot diaktifkan.`,
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
          localStorage.setItem(REMEMBERED_NIK_KEY, nik.trim());
        } else {
          localStorage.removeItem(REMEMBERED_NIK_KEY);
        }
      }

      setActiveUser(user);
      toast.success(`Selamat datang kembali, ${user.nama}!`, {
        description: `Login sebagai ${ROLE_LABELS[user.role]?.label || user.position_title}`,
      });

      if (user.role === "staff") {
        router.push("/karyawan/dashboard");
      } else {
        router.push("/admin/dashboard");
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
    if (!forgotNik.trim() || !forgotEmail.trim()) {
      toast.error("NIK dan Email resmi wajib diisi.");
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
        toast.success(res.message);
        setNik(forgotNik.trim());
        setPassword(newResetPassword);
        setIsForgotOpen(false);
        setForgotNik("");
        setForgotEmail("");
        setNewResetPassword("");
        setConfirmResetPassword("");
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal mereset password. Pastikan NIK dan Email sesuai.");
    } finally {
      setIsResetSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full bg-zinc-50 dark:bg-zinc-950 font-sans">
      {/* Left Side: Real Authentication Form */}
      <div className="w-full lg:w-[50%] xl:w-[46%] flex flex-col justify-between px-8 sm:px-14 lg:px-16 xl:px-24 py-8 lg:py-10 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800/80 min-h-screen">
        <div>
          {/* Header Branding */}
          <div className="flex items-center gap-3 mb-8">
            <div className="size-11 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/25">
              <ActivityIcon className="size-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white">
                WorkPulse <span className="text-red-600">Telkom Akses</span>
              </span>
              <p className="text-xs font-semibold text-zinc-400">Enterprise Task Management Platform</p>
            </div>
          </div>

          <div className="max-w-md">
            <div className="mb-6 mt-18">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Masuk ke Akun Anda
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
                Masukkan Nomor Induk Karyawan (NIK) resmi yang telah didaftarkan oleh Administrator HR.
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
                  Nomor Induk Karyawan (NIK)
                </label>
                <div className="relative mt-1.5">
                  <Input
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    placeholder="Masukkan 8-digit NIK Anda"
                    required
                    disabled={isLockedOut || isLoading}
                    className="h-11 rounded-[8px] bg-zinc-50 dark:bg-zinc-800/80 border-zinc-300 dark:border-zinc-700 text-sm font-semibold tracking-wide text-zinc-900 dark:text-zinc-100"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 select-none">
                    NIK
                  </span>
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
                      setForgotNik(nik);
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
                  <span>Ingat NIK & Sesi di Perangkat Ini</span>
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
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-2 mt-6">
          <span>© 2026 PT Telkom Akses. All rights reserved.</span>
        </div>
      </div>

      {/* Right Side: Enterprise Illustration & Quality Standard */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-[54%] bg-gradient-to-br from-zinc-900 via-zinc-950 to-red-950 p-12 lg:p-16 flex-col justify-between text-white relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-800/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold backdrop-blur-md">
            <ShieldCheckIcon className="size-4 text-red-400" />
            Sistem Manajemen Tugas Formal Telkom Akses
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight mt-6 leading-tight">
            Sentralisasi Penugasan & Rantai Komando Kantor dari <span className="text-red-400">Staff hingga SGM</span>
          </h2>
          <p className="text-sm xl:text-base text-zinc-300 mt-4 leading-relaxed max-w-xl">
            Solusi sentralisasi delegasi dokumen proposal, rekapitulasi laporan keuangan SPJ, dan pengawasan SLA pengerjaan tugas operasional kantor.
          </p>
        </div>

        {/* 3 Core Highlights */}
        <div className="grid grid-cols-1 gap-3.5 relative z-10 my-10 max-w-xl">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3.5">
            <div className="size-9 rounded-xl bg-red-600/25 border border-red-500/30 text-red-400 flex items-center justify-center font-black text-xs shrink-0">
              01
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Hierarchical Delegation System</h4>
              <p className="text-[11px] text-zinc-400">Pendelegasian tugas 6 tingkat hierarki (SGM ➡️ Manager ➡️ Officer 3 ➡️ Officer 2 ➡️ Officer 1 ➡️ Staff).</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3.5">
            <div className="size-9 rounded-xl bg-blue-600/25 border border-blue-500/30 text-blue-400 flex items-center justify-center font-black text-xs shrink-0">
              02
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Smart Task Recommendation Engine</h4>
              <p className="text-[11px] text-zinc-400">Kalkulasi rekomendasi pelaksana terbaik berdasarkan beban kerja (*workload*) dan skor SLA.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3.5">
            <div className="size-9 rounded-xl bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-xs shrink-0">
              03
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Verifikasi Hasil Kerja & SPJ</h4>
              <p className="text-[11px] text-zinc-400">Lampiran berkas, nota kwitansi anggaran kantor, dan persetujuan bertingkat.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-zinc-400 border-t border-white/10 pt-6">
          <div className="flex items-center gap-2">
            <CheckCircle2Icon className="size-4 text-emerald-400" />
            <span>Terhubung ke Database Cloud Supabase PostgreSQL</span>
          </div>
          <span>Keamanan Data Terenkripsi</span>
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
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                forgotTab === "reset"
                  ? "bg-white dark:bg-zinc-800 text-foreground shadow-xs"
                  : "text-muted-foreground"
              }`}
            >
              Reset Mandiri
            </button>
            <button
              type="button"
              onClick={() => setForgotTab("helpdesk")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                forgotTab === "helpdesk"
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
                  Nomor Induk Karyawan (NIK) *
                </label>
                <Input
                  value={forgotNik}
                  onChange={(e) => setForgotNik(e.target.value)}
                  placeholder="Contoh: 10293841"
                  required
                  className="mt-1 h-10 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Email Resmi Telkom Akses *
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
