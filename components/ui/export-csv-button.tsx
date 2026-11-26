"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { exportToCSV } from "@/lib/export"

export function ExportCSVButton({
  rows,
  filename,
  label = "Export CSV",
}: {
  rows: Record<string, unknown>[]
  filename: string
  label?: string
}) {
  return (
    <Button variant="outline" size="sm" onClick={() => exportToCSV(rows, filename)}>
      <Download className="size-4 mr-1.5" />
      {label}
    </Button>
  )
}
