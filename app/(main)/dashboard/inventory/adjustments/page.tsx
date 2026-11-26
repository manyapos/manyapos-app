import { redirect } from "next/navigation"

export default function StockAdjustmentPage() {
  redirect("/dashboard/inventory?tab=adjustment")
}
