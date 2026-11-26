"use client"

import { useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { Receipt } from "@/components/pos/receipt"

type ReceiptData = React.ComponentPropsWithoutRef<typeof Receipt>

export function PrintReceiptButton({ data, label = "Cetak Struk" }: { data: ReceiptData; label?: string }) {
  const contentRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({ contentRef })

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => handlePrint()}>
        <Printer className="size-4 mr-1.5" />
        {label}
      </Button>
      {/* Hidden receipt — only rendered for print */}
      <div style={{ display: "none" }}>
        <Receipt ref={contentRef} {...data} />
      </div>
    </>
  )
}
