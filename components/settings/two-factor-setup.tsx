"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, ShieldOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

export function TwoFactorSetup({ enabled }: { enabled: boolean }) {
  const [isEnabled, setIsEnabled] = useState(enabled)
  const [step, setStep] = useState<"idle" | "scan" | "verify">("idle")
  const [qrDataUrl, setQrDataUrl] = useState("")
  const [secret, setSecret] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)

  async function startSetup() {
    setLoading(true)
    const res = await fetch("/api/auth/2fa/setup")
    const data = await res.json()
    setQrDataUrl(data.qrDataUrl)
    setSecret(data.secret)
    setStep("scan")
    setLoading(false)
  }

  async function confirmSetup() {
    if (code.length !== 6) { toast.error("Kode harus 6 digit"); return }
    setLoading(true)
    const res = await fetch("/api/auth/2fa/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, action: "enable" }),
    })
    if (!res.ok) { const d = await res.json(); toast.error(d.error); setLoading(false); return }
    setIsEnabled(true); setStep("idle"); setCode("")
    toast.success("2FA berhasil diaktifkan")
    setLoading(false)
  }

  async function disable2FA() {
    setLoading(true)
    await fetch("/api/auth/2fa/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "disable" }),
    })
    setIsEnabled(false)
    toast.success("2FA dinonaktifkan")
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Two-Factor Authentication
              <Badge variant={isEnabled ? "default" : "secondary"}>
                {isEnabled ? "Aktif" : "Nonaktif"}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              Tambahkan lapisan keamanan ekstra menggunakan Google Authenticator atau Authy.
            </CardDescription>
          </div>
          {isEnabled ? <ShieldCheck className="size-8 text-green-500" /> : <ShieldOff className="size-8 text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "idle" && (
          <>
            {isEnabled ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  2FA aktif. Setiap login akan memerlukan kode dari aplikasi authenticator Anda.
                </p>
                <Button variant="destructive" onClick={disable2FA} disabled={loading}>
                  {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                  Nonaktifkan 2FA
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  2FA belum aktif. Aktifkan untuk mengamankan akun Anda dengan kode verifikasi tambahan.
                </p>
                <Button onClick={startSetup} disabled={loading}>
                  {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                  Aktifkan 2FA
                </Button>
              </div>
            )}
          </>
        )}

        {step === "scan" && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-medium">Langkah 1: Scan QR Code</p>
              <p className="text-xs text-muted-foreground">
                Buka Google Authenticator / Authy → Add Account → Scan QR Code
              </p>
              {qrDataUrl && (
                <div className="flex justify-center">
                  <Image src={qrDataUrl} alt="2FA QR Code" width={180} height={180} className="rounded-lg border" />
                </div>
              )}
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Tidak bisa scan? Masukkan kode manual</summary>
                <code className="mt-2 block break-all rounded bg-muted px-2 py-1 font-mono text-xs">{secret}</code>
              </details>
            </div>
            <div className="space-y-1.5">
              <Label>Langkah 2: Masukkan kode 6 digit dari aplikasi</Label>
              <div className="flex gap-2">
                <Input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000" maxLength={6} className="font-mono tracking-widest text-center text-lg" />
                <Button onClick={confirmSetup} disabled={loading || code.length !== 6}>
                  {loading ? <Loader2 className="size-4 animate-spin" /> : "Verifikasi"}
                </Button>
              </div>
            </div>
            <button type="button" onClick={() => { setStep("idle"); setCode("") }}
              className="text-sm text-muted-foreground hover:text-foreground">
              Batal
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
