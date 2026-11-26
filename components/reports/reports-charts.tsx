"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from "recharts"
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
  ChartLegend, ChartLegendContent, type ChartConfig,
} from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const barConfig = {
  total: { label: "Penjualan", color: "var(--chart-1)" },
} satisfies ChartConfig

export function ReportsCharts({
  dailySales,
  categoryData,
}: {
  dailySales: { date: string; total: number }[]
  categoryData: { name: string; value: number }[]
}) {
  // Build pie config dynamically from category names
  const pieConfig = Object.fromEntries(
    categoryData.map((c, i) => [c.name, { label: c.name, color: `var(--chart-${(i % 5) + 1})` }])
  ) satisfies ChartConfig

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Penjualan Harian</CardTitle></CardHeader>
        <CardContent>
          <ChartContainer config={barConfig} className="h-64 w-full">
            <BarChart data={dailySales}>
              <CartesianGrid vertical={false} className="stroke-border" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <ChartTooltip content={<ChartTooltipContent formatter={(v) => [`Rp ${Number(v).toLocaleString("id-ID")}`, "Penjualan"]} />} />
              <Bar dataKey="total" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Penjualan per Kategori</CardTitle></CardHeader>
        <CardContent>
          <ChartContainer config={pieConfig} className="h-64 w-full">
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {categoryData.map((c, i) => (
                  <Cell key={i} fill={`var(--chart-${(i % 5) + 1})`} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent formatter={(v) => `Rp ${Number(v).toLocaleString("id-ID")}`} nameKey="name" />} />
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
