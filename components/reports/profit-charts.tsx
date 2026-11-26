"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, ComposedChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type DailyData = { date: string; revenue: number; cogs: number; expenses: number; profit: number }

const chartConfig = {
  revenue: { label: "Pendapatan", color: "var(--chart-1)" },
  cogs:    { label: "HPP",        color: "var(--chart-2)" },
  expenses:{ label: "Pengeluaran",color: "var(--chart-3)" },
  profit:  { label: "Laba Bersih",color: "var(--chart-4)" },
} satisfies ChartConfig

export function ProfitCharts({ data }: { data: DailyData[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Tren Laba Rugi Harian</CardTitle></CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} className="stroke-border" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 100000).toFixed(0)}rb`} width={40} />
            <ChartTooltip content={<ChartTooltipContent formatter={(v) => [`Rp ${Number(v).toLocaleString("id-ID")}`]} />} />
            <ChartLegend content={<ChartLegendContent />} verticalAlign="bottom" />
            <Bar dataKey="revenue"  fill="var(--chart-1)" opacity={0.85} radius={[3, 3, 0, 0]} />
            <Bar dataKey="cogs"     fill="var(--chart-2)" opacity={0.7}  radius={[3, 3, 0, 0]} />
            <Bar dataKey="expenses" fill="var(--chart-3)" opacity={0.7}  radius={[3, 3, 0, 0]} />
            <Line dataKey="profit"  stroke="var(--chart-4)" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
