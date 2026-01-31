"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Droplets } from "lucide-react"

const dailyData = [
  { date: "Lun AM", glucose: 92 },
  { date: "Lun PM", glucose: 110 },
  { date: "Mar AM", glucose: 95 },
  { date: "Mar PM", glucose: 108 },
  { date: "Mié AM", glucose: 90 },
  { date: "Mié PM", glucose: 112 },
  { date: "Jue AM", glucose: 93 },
  { date: "Jue PM", glucose: 109 },
  { date: "Vie AM", glucose: 95 },
  { date: "Vie PM", glucose: 110 },
  { date: "Sáb AM", glucose: 88 },
  { date: "Sáb PM", glucose: 105 },
  { date: "Dom AM", glucose: 92 },
  { date: "Dom PM", glucose: 108 },
]

const weeklyData = [
  { date: "S1", glucoseAM: 95, glucosePM: 110 },
  { date: "S2", glucoseAM: 92, glucosePM: 108 },
  { date: "S3", glucoseAM: 90, glucosePM: 112 },
  { date: "S4", glucoseAM: 93, glucosePM: 109 },
]

const monthlyData = [
  { date: "Ene", glucoseAM: 98, glucosePM: 115 },
  { date: "Feb", glucoseAM: 96, glucosePM: 112 },
  { date: "Mar", glucoseAM: 94, glucosePM: 110 },
  { date: "Abr", glucoseAM: 92, glucosePM: 108 },
  { date: "May", glucoseAM: 93, glucosePM: 109 },
  { date: "Jun", glucoseAM: 95, glucosePM: 110 },
]

export function GlucoseCard() {
  const morningGlucose = 95
  const eveningGlucose = 110
  const isNormalMorning = morningGlucose >= 70 && morningGlucose <= 100
  const isNormalEvening = eveningGlucose >= 70 && eveningGlucose <= 140

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-chart-5/10 p-2">
              <Droplets className="h-5 w-5 text-chart-5" />
            </div>
            <div>
              <CardTitle>Glucómetro</CardTitle>
              <CardDescription>Niveles de glucosa en sangre</CardDescription>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-right">
            <div>
              <div className="text-xs text-muted-foreground">Mañana</div>
              <div className="text-xl font-bold">{morningGlucose}</div>
              <div className="text-xs text-muted-foreground">mg/dL</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Tarde</div>
              <div className="text-xl font-bold">{eveningGlucose}</div>
              <div className="text-xs text-muted-foreground">mg/dL</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="days" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="days">Días</TabsTrigger>
            <TabsTrigger value="weeks">Semanas</TabsTrigger>
            <TabsTrigger value="months">Meses</TabsTrigger>
          </TabsList>

          <TabsContent value="days" className="space-y-4">
            <ChartContainer
              config={{
                glucose: {
                  label: "Glucosa (mg/dL)",
                  color: "hsl(var(--chart-5))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} domain={[70, 140]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="glucose"
                    stroke="hsl(var(--chart-5))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-5))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="weeks" className="space-y-4">
            <ChartContainer
              config={{
                glucoseAM: {
                  label: "Mañana",
                  color: "hsl(var(--chart-5))",
                },
                glucosePM: {
                  label: "Tarde",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} domain={[70, 140]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="glucoseAM"
                    stroke="hsl(var(--chart-5))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-5))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="glucosePM"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-1))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="months" className="space-y-4">
            <ChartContainer
              config={{
                glucoseAM: {
                  label: "Mañana",
                  color: "hsl(var(--chart-5))",
                },
                glucosePM: {
                  label: "Tarde",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} domain={[70, 140]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="glucoseAM"
                    stroke="hsl(var(--chart-5))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-5))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="glucosePM"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-1))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={`rounded-lg p-4 ${isNormalMorning ? "bg-success/10" : "bg-warning/10"}`}>
            <div className={`text-sm font-medium ${isNormalMorning ? "text-success" : "text-warning"}`}>
              Mañana: {isNormalMorning ? "✓ Normal" : "⚠ Revisar"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Rango normal en ayunas: 70-100 mg/dL</div>
          </div>
          <div className={`rounded-lg p-4 ${isNormalEvening ? "bg-success/10" : "bg-warning/10"}`}>
            <div className={`text-sm font-medium ${isNormalEvening ? "text-success" : "text-warning"}`}>
              Tarde: {isNormalEvening ? "✓ Normal" : "⚠ Revisar"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Rango normal postprandial: 70-140 mg/dL</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
