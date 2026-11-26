"use client"

import * as React from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { CalendarIcon, X } from "lucide-react"
import { type DateRange } from "react-day-picker"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "cn"

interface DateRangePickerProps {
  fromKey?: string
  toKey?: string
  className?: string
  placeholder?: string
  align?: "start" | "center" | "end"
}

export function DateRangePicker({
  fromKey = "from",
  toKey = "to",
  className,
  placeholder = "Pilih rentang tanggal",
  align = "start",
}: DateRangePickerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const fromStr = searchParams.get(fromKey)
  const toStr = searchParams.get(toKey)

  const [range, setRange] = React.useState<DateRange | undefined>(
    fromStr || toStr
      ? {
          from: fromStr ? new Date(fromStr) : undefined,
          to: toStr ? new Date(toStr) : undefined,
        }
      : undefined
  )

  function applyRange(r: DateRange | undefined) {
    setRange(r)
    const params = new URLSearchParams(searchParams.toString())
    if (r?.from) params.set(fromKey, format(r.from, "yyyy-MM-dd"))
    else params.delete(fromKey)
    if (r?.to) params.set(toKey, format(r.to, "yyyy-MM-dd"))
    else params.delete(toKey)
    router.push(`${pathname}?${params.toString()}`)
  }

  const label = range?.from
    ? range.to
      ? `${format(range.from, "d MMM yyyy", { locale: id })} – ${format(range.to, "d MMM yyyy", { locale: id })}`
      : format(range.from, "d MMM yyyy", { locale: id })
    : placeholder

  const hasRange = !!range?.from

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              "h-9 justify-start gap-2 text-left font-normal",
              !hasRange && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <CalendarIcon className="size-4 shrink-0" />
        <span className="text-sm">{label}</span>
        {hasRange && (
          <span
            role="button"
            tabIndex={0}
            onClick={e => { e.stopPropagation(); applyRange(undefined) }}
            onKeyDown={e => e.key === "Enter" && applyRange(undefined)}
            className="ml-auto rounded-sm p-0.5 hover:bg-muted"
          >
            <X className="size-3" />
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode="range"
          selected={range}
          onSelect={applyRange}
          numberOfMonths={2}
          locale={id}
          captionLayout="label"
        />
      </PopoverContent>
    </Popover>
  )
}

// Single date picker variant
export function DatePicker({
  paramKey,
  placeholder = "Pilih tanggal",
  className,
  align = "start",
}: {
  paramKey: string
  placeholder?: string
  className?: string
  align?: "start" | "center" | "end"
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const str = searchParams.get(paramKey)
  const [date, setDate] = React.useState<Date | undefined>(str ? new Date(str) : undefined)

  function applyDate(d: Date | undefined) {
    setDate(d)
    const params = new URLSearchParams(searchParams.toString())
    if (d) params.set(paramKey, format(d, "yyyy-MM-dd"))
    else params.delete(paramKey)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              "h-9 justify-start gap-2 font-normal",
              !date && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <CalendarIcon className="size-4 shrink-0" />
        <span className="text-sm">
          {date ? format(date, "d MMM yyyy", { locale: id }) : placeholder}
        </span>
        {date && (
          <span
            role="button"
            tabIndex={0}
            onClick={e => { e.stopPropagation(); applyDate(undefined) }}
            onKeyDown={e => e.key === "Enter" && applyDate(undefined)}
            className="ml-auto rounded-sm p-0.5 hover:bg-muted"
          >
            <X className="size-3" />
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={applyDate}
          locale={id}
        />
      </PopoverContent>
    </Popover>
  )
}
