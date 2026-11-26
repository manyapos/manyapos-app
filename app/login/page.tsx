"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"

import { LoginCarousel } from "@/components/login-carousel"
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
} from "lucide-react"
import { cn } from "cn"
import { Captcha } from "@/components/ui/captcha"

type Step = "login" | "2fa" | "forgot" | "forgot-sent"

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
  captchaToken: z.string().min(1, "Captcha wajib diisi"),
  captchaAnswer: z.string().min(1, "Captcha wajib diisi"),
})
type LoginValues = z.infer<typeof loginSchema>

const twoFaSchema = z.object({
  code: z
    .string()
    .min(6, "Kode harus 6 digit")
    .max(6, "Kode harus 6 digit")
    .regex(/^\d{6}$/, "Kode harus 6 digit angka"),
})
type TwoFaValues = z.infer<typeof twoFaSchema>

const forgotSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
})
type ForgotValues = z.infer<typeof forgotSchema>

export default function LoginPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>("login")
  const [showPw, setShowPw] = useState(false)
  const [pendingUserId, setPendingUserId] = useState("")
  const [forgotEmail, setForgotEmail] = useState("")

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // ── Login form ───────────────────────────────────────────────
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      captchaToken: "",
      captchaAnswer: "",
    },
  })

  function onCaptchaVerify(token: string, answer: string) {
    loginForm.setValue("captchaToken", token, { shouldValidate: true })
    loginForm.setValue("captchaAnswer", answer, { shouldValidate: true })
  }

  async function handleEmailLogin(data: LoginValues) {
    setLoading(true)
    setError("")

    const captchaRes = await fetch("/api/auth/verify-captcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: data.captchaToken,
        answer: data.captchaAnswer,
      }),
    })
    if (!captchaRes.ok) {
      setError("Captcha salah. Coba lagi.")
      setLoading(false)
      return
    }

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })
    if (result?.error) {
      setError("Email atau password salah")
      setLoading(false)
      return
    }

    const sessRes = await fetch("/api/auth/session")
    const sess = (await sessRes.json()) as {
      user?: { id: string; twoFactorEnabled: boolean }
    }
    if (sess?.user?.twoFactorEnabled) {
      setPendingUserId(sess.user.id)
      setStep("2fa")
      setLoading(false)
      return
    }

    router.push("/")
    router.refresh()
  }

  // ── 2FA form ─────────────────────────────────────────────────
  const twoFaForm = useForm<TwoFaValues>({
    resolver: zodResolver(twoFaSchema),
    mode: "onChange",
    defaultValues: { code: "" },
  })

  async function handle2FA(data: TwoFaValues) {
    setError("")
    const res = await fetch("/api/auth/2fa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: pendingUserId, code: data.code }),
    })
    if (!res.ok) {
      const d = (await res.json()) as { error: string }
      setError(d.error)
      return
    }
    router.push("/")
    router.refresh()
  }

  // ── Forgot form ──────────────────────────────────────────────
  const forgotForm = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  })

  async function handleForgot(data: ForgotValues) {
    setError("")
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email }),
    })
    setForgotEmail(data.email)
    setStep("forgot-sent")
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="flex min-h-svh">
      {/* Carousel branding panel */}
      <div className="hidden lg:block lg:w-1/2">
        <LoginCarousel />
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background p-6">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <Logo size={28} className="text-primary" />
          <span className="font-heading text-xl font-bold">Manya POS</span>
        </div>

        <div className="w-full max-w-sm">
          {/* ── Step: 2FA ── */}
          {step === "2fa" && (
            <>
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
                  <KeyRound className="size-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Verifikasi 2FA</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Buka Google Authenticator dan masukkan kode 6 digit
                </p>
              </div>
              <form
                onSubmit={twoFaForm.handleSubmit(handle2FA)}
                className="space-y-5"
              >
                {error && <ErrorBox>{error}</ErrorBox>}
                <div className="space-y-1.5">
                  <Label htmlFor="2fa-code">Kode Autentikasi</Label>
                  <Input
                    id="2fa-code"
                    {...twoFaForm.register("code")}
                    placeholder="000000"
                    maxLength={6}
                    className="text-center font-mono text-2xl tracking-[0.5em]"
                    autoFocus
                  />
                  <FieldError
                    message={twoFaForm.formState.errors.code?.message}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={
                    !twoFaForm.formState.isValid ||
                    twoFaForm.formState.isSubmitting
                  }
                >
                  {twoFaForm.formState.isSubmitting
                    ? "Memverifikasi..."
                    : "Verifikasi"}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("login")
                    twoFaForm.reset()
                    setError("")
                  }}
                  className="flex w-full items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-4" /> Kembali ke login
                </button>
              </form>
            </>
          )}

          {/* ── Step: Forgot password form ── */}
          {step === "forgot" && (
            <>
              <div className="mb-8">
                <button
                  onClick={() => {
                    setStep("login")
                    setError("")
                  }}
                  className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-4" /> Kembali
                </button>
                <h2 className="text-2xl font-bold">Lupa Password?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Masukkan email Anda dan kami akan kirim link reset password.
                </p>
              </div>
              <form
                onSubmit={forgotForm.handleSubmit(handleForgot)}
                className="space-y-5"
              >
                {error && <ErrorBox>{error}</ErrorBox>}
                <div className="space-y-1.5">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    {...forgotForm.register("email")}
                    placeholder="nama@toko.com"
                    autoFocus
                  />
                  <FieldError
                    message={forgotForm.formState.errors.email?.message}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={
                    !forgotForm.formState.isValid ||
                    forgotForm.formState.isSubmitting
                  }
                >
                  {forgotForm.formState.isSubmitting
                    ? "Mengirim..."
                    : "Kirim Link Reset"}
                </Button>
              </form>
            </>
          )}

          {/* ── Step: Forgot sent ── */}
          {step === "forgot-sent" && (
            <div className="space-y-4 text-center">
              <CheckCircle2 className="mx-auto size-12 text-green-500" />
              <div>
                <p className="text-xl font-bold">Email terkirim!</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cek inbox{" "}
                  <span className="font-medium text-foreground">
                    {forgotEmail}
                  </span>{" "}
                  untuk link reset password. Link berlaku 1 jam.
                </p>
              </div>
              <button
                onClick={() => {
                  setStep("login")
                  setForgotEmail("")
                }}
                className="text-sm text-primary hover:underline"
              >
                Kembali ke login
              </button>
            </div>
          )}

          {/* ── Step: Main login ── */}
          {step === "login" && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold">Selamat datang kembali</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Masuk untuk melanjutkan ke dashboard
                </p>
              </div>

              {error && <ErrorBox className="mb-4">{error}</ErrorBox>}

              <form
                onSubmit={loginForm.handleSubmit(handleEmailLogin)}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...loginForm.register("email")}
                    placeholder="nama@toko.com"
                    autoComplete="email"
                  />
                  <FieldError
                    message={loginForm.formState.errors.email?.message}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("forgot")
                        forgotForm.setValue(
                          "email",
                          loginForm.getValues("email")
                        )
                        setError("")
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      Lupa password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPw ? "text" : "password"}
                      {...loginForm.register("password")}
                      placeholder="••••••••"
                      autoComplete="current-password"
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
                  <FieldError
                    message={loginForm.formState.errors.password?.message}
                  />
                </div>

                <Captcha onVerify={onCaptchaVerify} />
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={!loginForm.formState.isValid || loading}
                >
                  {loading ? <Spinner /> : "Masuk"}
                </Button>
              </form>
            </>
          )}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <a
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Daftar
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-sm text-destructive">{message}</p>
}

function ErrorBox({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive",
        className
      )}
    >
      <AlertCircle className="size-4 shrink-0" />
      {children}
    </div>
  )
}

function Spinner() {
  return (
    <span className="flex items-center gap-2">
      <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
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
      Memproses...
    </span>
  )
}
