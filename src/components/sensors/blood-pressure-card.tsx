"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Heart, TrendingUp } from "lucide-react"

// Datos de ejemplo para gráficas históricas
const dailyData = [
  { date: "Lun", systolic: 118, diastolic: 78 },
  { date: "Mar", systolic: 120, diastolic: 80 },
  { date: "Mié", systolic: 122, diastolic: 82 },
  { date: "Jue", systolic: 119, diastolic: 79 },
  { date: "Vie", systolic: 121, diastolic: 81 },
  { date: "Sáb", systolic: 120, diastolic: 80 },
  { date: "Dom", systolic: 118, diastolic: 78 },
]

const weeklyData = [
  { date: "S1", systolic: 119, diastolic: 79 },
  { date: "S2", systolic: 121, diastolic: 81 },
  { date: "S3", systolic: 118, diastolic: 78 },
  { date: "S4", systolic: 120, diastolic: 80 },
]

const monthlyData = [
  { date: "Ene", systolic: 120, diastolic: 80 },
  { date: "Feb", systolic: 119, diastolic: 79 },
  { date: "Mar", systolic: 121, diastolic: 81 },
  { date: "Abr", systolic: 118, diastolic: 78 },
  { date: "May", systolic: 120, diastolic: 80 },
  { date: "Jun", systolic: 122, diastolic: 82 },
]

const yearlyData = [
  { date: "2022", systolic: 122, diastolic: 82 },
  { date: "2023", systolic: 120, diastolic: 80 },
  { date: "2024", systolic: 119, diastolic: 79 },
]

export function BloodPressureCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-chart-1/10 p-2">
              <Heart className="h-5 w-5 text-chart-1" />
            </div>
            <div>
              <CardTitle>Tensiómetro</CardTitle>
              <CardDescription>Presión arterial diaria</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">120/80</div>
            <div className="text-xs text-muted-foreground">mmHg</div>
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
                systolic: {
                  label: "Sistólica",
                  color: "hsl(var(--chart-1))",
                },
                diastolic: {
                  label: "Diastólica",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="systolic"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-1))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="weeks" className="space-y-4">
            <ChartContainer
              config={{
                systolic: {
                  label: "Sistólica",
                  color: "hsl(var(--chart-1))",
                },
                diastolic: {
                  label: "Diastólica",
                  color: "hsl(var(--chart-2))",
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
                    dataKey="systolic"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-1))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="months" className="space-y-4">
            <ChartContainer
              config={{
                systolic: {
                  label: "Sistólica",
                  color: "hsl(var(--chart-1))",
                },
                diastolic: {
                  label: "Diastólica",
                  color: "hsl(var(--chart-2))",
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
                    dataKey="systolic"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-1))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="years" className="space-y-4">
            <ChartContainer
              config={{
                systolic: {
                  label: "Sistólica",
                  color: "hsl(var(--chart-1))",
                },
                diastolic: {
                  label: "Diastólica",
                  color: "hsl(var(--chart-2))",
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
                    dataKey="systolic"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-1))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>

        {/* Promedio Anual */}
        <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-sm font-medium">Promedio Anual</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">120/80 mmHg</div>
            <div className="text-xs text-muted-foreground">Rango Normal</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
