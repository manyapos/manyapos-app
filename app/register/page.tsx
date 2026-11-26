"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { LoginCarousel } from "@/components/login-carousel"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { Captcha } from "@/components/ui/captcha"

const registerSchema = z
  .object({
    name: z.string().min(1, "Nama wajib diisi"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z
      .string()
      .min(6, "Konfirmasi password minimal 6 karakter"),
    captchaToken: z.string().min(1, "Captcha wajib diisi"),
    captchaAnswer: z.string().min(1, "Captcha wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  })

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  })

  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function onCaptchaVerify(token: string, answer: string) {
    setValue("captchaToken", token, { shouldValidate: true })
    setValue("captchaAnswer", answer, { shouldValidate: true })
  }

  async function onSubmit(values: RegisterForm) {
    setError("")
    setLoading(true)

    const captchaRes = await fetch("/api/auth/verify-captcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: values.captchaToken,
        answer: values.captchaAnswer,
      }),
    })
    if (!captchaRes.ok) {
      setError("Captcha salah. Coba lagi.")
      setLoading(false)
      return
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        password: values.password,
      }),
    })
    const data = (await res.json()) as { ok?: boolean; error?: string }

    if (!res.ok) {
      setError(data.error || "Gagal mendaftar")
      setLoading(false)
      return
    }

    router.push("/login")
  }

  return (
    <div className="flex min-h-svh">
      <div className="hidden lg:block lg:w-1/2">
        <LoginCarousel />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-background p-6">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <Logo size={28} className="text-primary" />
          <span className="font-heading text-xl font-bold">Manya POS</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Buat Akun Baru</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Daftar untuk mulai menggunakan Manya POS
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Nama lengkap"
                autoFocus
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="nama@email.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  {...register("password")}
                  placeholder="Minimal 6 karakter"
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Konfirmasi Password</Label>
              <Input
                id="confirm-password"
                type={showPw ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="Ulangi password"
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Captcha onVerify={onCaptchaVerify} />
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!isValid || loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="size-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Mendaftar...
                </span>
              ) : (
                "Daftar"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <a
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Masuk
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
