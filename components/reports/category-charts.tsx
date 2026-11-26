"use client"

import { Pie, PieChart, Cell, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)",
]

export function CategoryCharts({ data }: { data: { name: string; total: number; qty: number }[] }) {
  const pieData = data.map(d => ({ name: d.name, value: d.total }))

  const pieConfig = Object.fromEntries(
    data.map((d, i) => [d.name, { label: d.name, color: COLORS[i % COLORS.length] }])
  ) satisfies ChartConfig

  const barConfig = { total: { label: "Penjualan", color: "var(--chart-1)" } } satisfies ChartConfig

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card data-tour="category-pie">
        <CardContent>
          <ChartContainer config={pieConfig} className="min-h-[280px] w-full">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent hideLabel formatter={(v) => [`Rp ${Number(v).toLocaleString("id-ID")}`]} />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card data-tour="category-bar">
        <CardHeader><CardTitle className="text-base">Revenue per Kategori</CardTitle></CardHeader>
        <CardContent>
          <ChartContainer config={barConfig} className="min-h-[280px] w-full">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} layout="vertical">
              <CartesianGrid horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`} width={40} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent hideLabel formatter={(v) => [`Rp ${Number(v).toLocaleString("id-ID")}`]} />} />
              <Bar dataKey="total" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
