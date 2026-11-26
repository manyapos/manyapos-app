"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import React from "react"

const chartConfig = {
  total: { label: "Penjualan", color: "var(--chart-1)" },
} satisfies ChartConfig

export function DashboardCharts({ data, ...props }: { data: { date: string; total: number }[] } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Penjualan 7 Hari Terakhir</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <LineChart data={data}>
            <CartesianGrid vertical={false} className="stroke-border" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 100000).toFixed(0)}rb`} width={40} />
            <ChartTooltip
              content={<ChartTooltipContent
                hideLabel
                formatter={(value) => [`Rp ${Number(value).toLocaleString("id-ID")}`]}
              />}
            />
            <Line
              dataKey="total"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--chart-1)" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
