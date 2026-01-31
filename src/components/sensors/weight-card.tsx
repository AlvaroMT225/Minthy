"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Scale } from "lucide-react"

const dailyData = [
  { date: "Lun", weight: 70.2, bmi: 24.5 },
  { date: "Mar", weight: 70.5, bmi: 24.6 },
  { date: "Mié", weight: 70.3, bmi: 24.5 },
  { date: "Jue", weight: 70.4, bmi: 24.6 },
  { date: "Vie", weight: 70.5, bmi: 24.6 },
  { date: "Sáb", weight: 70.6, bmi: 24.7 },
  { date: "Dom", weight: 70.5, bmi: 24.6 },
]

const weeklyData = [
  { date: "S1", weight: 71.2, bmi: 24.9 },
  { date: "S2", weight: 70.8, bmi: 24.7 },
  { date: "S3", weight: 70.5, bmi: 24.6 },
  { date: "S4", weight: 70.5, bmi: 24.6 },
]

const monthlyData = [
  { date: "Ene", weight: 72.0, bmi: 25.1 },
  { date: "Feb", weight: 71.5, bmi: 25.0 },
  { date: "Mar", weight: 71.0, bmi: 24.8 },
  { date: "Abr", weight: 70.8, bmi: 24.7 },
  { date: "May", weight: 70.5, bmi: 24.6 },
  { date: "Jun", weight: 70.5, bmi: 24.6 },
]

const yearlyData = [
  { date: "2022", weight: 73.0, bmi: 25.5 },
  { date: "2023", weight: 71.5, bmi: 25.0 },
  { date: "2024", weight: 70.5, bmi: 24.6 },
]

export function WeightCard() {
  const weight = 70.5
  const bmi = 24.6
  const height = 1.7 // metros

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-chart-4/10 p-2">
              <Scale className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <CardTitle>Peso / IMC</CardTitle>
              <CardDescription>Control de peso corporal</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{weight} kg</div>
            <div className="text-xs text-muted-foreground">IMC: {bmi}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="days" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="days">Días</TabsTrigger>
            <TabsTrigger value="weeks">Semanas</TabsTrigger>
            <TabsTrigger value="months">Meses</TabsTrigger>
            <TabsTrigger value="years">Años</TabsTrigger>
          </TabsList>

          <TabsContent value="days" className="space-y-4">
            <ChartContainer
              config={{
                weight: {
                  label: "Peso (kg)",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} domain={[69, 72]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-4))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="weeks" className="space-y-4">
            <ChartContainer
              config={{
                weight: {
                  label: "Peso (kg)",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-4))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="months" className="space-y-4">
            <ChartContainer
              config={{
                weight: {
                  label: "Peso (kg)",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-4))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="years" className="space-y-4">
            <ChartContainer
              config={{
                weight: {
                  label: "Peso (kg)",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-4))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>

        <div className="mt-4 rounded-lg bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Índice de Masa Corporal</div>
              <div className="text-xs text-muted-foreground">Altura: {height}m</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">{bmi}</div>
              <div className="text-xs text-success">Normal</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
