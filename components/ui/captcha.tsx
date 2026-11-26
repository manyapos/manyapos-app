"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { RefreshCw } from "lucide-react"

export function Captcha({
  onVerify,
}: {
  onVerify: (token: string, answer: string) => void
}) {
  const [svg, setSvg] = useState("")
  const [token, setToken] = useState("")
  const [answer, setAnswer] = useState("")

  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true
    fetch("/api/captcha")
      .then((r) => r.json() as Promise<{ svg: string; token: string }>)
      .then((data) => {
        setSvg(data.svg)
        setToken(data.token)
      })
  }, [])

  function reload() {
    setAnswer("")
    fetch("/api/captcha")
      .then((r) => r.json() as Promise<{ svg: string; token: string }>)
      .then((data) => {
        setSvg(data.svg)
        setToken(data.token)
      })
  }

  function handleChange(val: string) {
    setAnswer(val)
    if (val.length >= 1) onVerify(token, val)
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-md border bg-muted/40 px-2 py-1 [&_svg]:h-8 [&_svg]:w-auto"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <span className="text-sm text-muted-foreground">=</span>
      <Input
        value={answer}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="?"
        maxLength={2}
        required
        className="w-16 text-center"
      />
      <button
        type="button"
        onClick={reload}
        className="rounded-md border p-2 text-muted-foreground hover:text-foreground"
      >
        <RefreshCw className="size-4" />
      </button>
    </div>
  )
}
