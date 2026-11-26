import { forwardRef } from "react"
import { formatRupiah, formatDate } from "@/lib/format"

type ReceiptItem = {
  productName: string
  quantity: number
  price: number
  discount: number
  subtotal: number
}

type ReceiptProps = {
  invoiceNumber: string
  createdAt: Date
  cashierName: string
  customerName?: string | null
  items: ReceiptItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  amountPaid: number
  change: number
  paymentMethod: string
  storeName: string
  storeAddress?: string
  storePhone?: string
  receiptHeader?: string
  receiptFooter?: string
  note?: string | null
}

// 80mm thermal receipt — forwardRef for react-to-print
export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(function Receipt(props, ref) {
  const {
    invoiceNumber, createdAt, cashierName, customerName, items,
    subtotal, discount, tax, total, amountPaid, change, paymentMethod,
    storeName, storeAddress, storePhone, receiptHeader, receiptFooter, note,
  } = props

  return (
    <div
      ref={ref}
      style={{
        fontFamily: "monospace",
        fontSize: "12px",
        width: "80mm",
        padding: "8px",
        color: "#000",
        background: "#fff",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <div style={{ fontWeight: "bold", fontSize: "16px" }}>{storeName}</div>
        {storeAddress && <div>{storeAddress}</div>}
        {storePhone && <div>Telp: {storePhone}</div>}
        {receiptHeader && <div style={{ marginTop: "4px" }}>{receiptHeader}</div>}
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

      {/* Invoice info */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>No:</span><span>{invoiceNumber}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Tgl:</span><span>{formatDate(createdAt)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Kasir:</span><span>{cashierName}</span>
      </div>
      {customerName && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Pelanggan:</span><span>{customerName}</span>
        </div>
      )}

      <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

      {/* Items */}
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: "4px" }}>
          <div>{item.productName}</div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{item.quantity} × {formatRupiah(item.price)}</span>
            <span>{formatRupiah(item.subtotal)}</span>
          </div>
          {item.discount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", color: "#666" }}>
              <span>  Diskon</span><span>-{formatRupiah(item.discount * item.quantity)}</span>
            </div>
          )}
        </div>
      ))}

      <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

      {/* Totals */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Subtotal</span><span>{formatRupiah(subtotal)}</span>
      </div>
      {discount > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Diskon</span><span>-{formatRupiah(discount)}</span>
        </div>
      )}
      {tax > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Pajak</span><span>{formatRupiah(tax)}</span>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "14px", marginTop: "4px" }}>
        <span>TOTAL</span><span>{formatRupiah(total)}</span>
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Bayar ({paymentMethod})</span><span>{formatRupiah(amountPaid)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Kembali</span><span>{formatRupiah(change)}</span>
      </div>

      {note && (
        <>
          <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />
          <div style={{ fontSize: "11px", color: "#666" }}>Catatan: {note}</div>
        </>
      )}

      <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

      <div style={{ textAlign: "center", marginTop: "8px", fontSize: "11px" }}>
        {receiptFooter || "Terima kasih telah berbelanja!"}
      </div>
    </div>
  )
})
