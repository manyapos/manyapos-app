"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react"

const resetSchema = z
  .object({
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Password tidak cocok",
    path: ["confirm"],
  })

type ResetValues = z.infer<typeof resetSchema>

function ResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    mode: "onChange",
  })

  async function onSubmit(values: ResetValues) {
    setError("")
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: values.password }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || "Gagal reset password")
      return
    }
    setDone(true)
  }

  if (!token)
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <AlertCircle className="size-4 shrink-0" />
        Link tidak valid. Minta reset password ulang.
      </div>
    )

  if (done)
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto size-12 text-green-500" />
        <div>
          <p className="font-semibold">Password berhasil direset!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Silakan login dengan password baru Anda.
          </p>
        </div>
        <Button className="w-full" onClick={() => router.push("/login")}>
          Ke halaman login
        </Button>
      </div>
    )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="password">Password Baru</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPw ? "text" : "password"}
            {...register("password")}
            placeholder="Minimal 6 karakter"
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
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm">Konfirmasi Password</Label>
        <Input
          id="confirm"
          type="password"
          {...register("confirm")}
          placeholder="Ulangi password"
        />
        {errors.confirm && (
          <p className="text-sm text-destructive">{errors.confirm.message}</p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? "Menyimpan..." : "Reset Password"}
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Logo size={36} className="text-primary" />
          <h1 className="text-2xl font-bold">Buat Password Baru</h1>
          <p className="text-sm text-muted-foreground">
            Masukkan password baru untuk akun Anda
          </p>
        </div>
        <div className="rounded-xl border bg-background p-6 shadow-sm">
          <Suspense>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
