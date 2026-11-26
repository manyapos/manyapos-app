"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { DateRangePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FilterDef {
  type: "daterange" | "select" | "text" | "date"
  fromKey?: string
  toKey?: string
  key?: string
  label: string
  options?: { value: string; label: string }[]
  placeholder?: string
}

interface FilterBarProps {
  filters: FilterDef[]
}

export function FilterBar({ filters }: FilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function set(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`${pathname}?${params.toString()}`)
  }

  const hasAny = filters.some(f =>
    f.type === "daterange"
      ? searchParams.get(f.fromKey ?? "from") || searchParams.get(f.toKey ?? "to")
      : f.key && searchParams.get(f.key)
  )

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((f, i) => {
        if (f.type === "daterange") {
          return (
            <DateRangePicker
              key={i}
              fromKey={f.fromKey ?? "from"}
              toKey={f.toKey ?? "to"}
              placeholder={f.placeholder ?? f.label}
            />
          )
        }

        if (f.type === "select" && f.key) {
          const current = searchParams.get(f.key) ?? ""
          return (
            <Select key={f.key} value={current} onValueChange={v => set(f.key!, v === "__all__" ? "" : v)}>
              <SelectTrigger className="h-9 w-auto min-w-32">
                <SelectValue placeholder={`${f.label}: Semua`}>
                  {current ? f.options?.find(o => o.value === current)?.label : `${f.label}: Semua`}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{f.label}: Semua</SelectItem>
                {f.options?.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        }

        if (f.key) {
          return (
            <input
              key={f.key}
              type={f.type}
              placeholder={f.placeholder ?? f.label}
              defaultValue={searchParams.get(f.key) ?? ""}
              onBlur={e => set(f.key!, e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          )
        }
        return null
      })}

      {hasAny && (
        <button
          onClick={() => router.push(pathname)}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          Reset
        </button>
      )}
    </div>
  )
}

