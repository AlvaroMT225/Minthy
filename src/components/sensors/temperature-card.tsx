"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Thermometer } from "lucide-react"

export function TemperatureCard() {
  const temperature = 36.5
  const isNormal = temperature >= 36.1 && temperature <= 37.2

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-chart-2/10 p-2">
            <Thermometer className="h-5 w-5 text-chart-2" />
          </div>
          <div>
            <CardTitle>Termómetro</CardTitle>
            <CardDescription>Temperatura corporal</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-bold text-chart-2">{temperature}</div>
              <div className="text-2xl text-muted-foreground">°C</div>
            </div>
          </div>

          <div className={`rounded-lg p-4 text-center ${isNormal ? "bg-success/10" : "bg-warning/10"}`}>
            <div className={`text-sm font-medium ${isNormal ? "text-success" : "text-warning"}`}>
              {isNormal ? "✓ Temperatura Normal" : "⚠ Temperatura Fuera de Rango"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Rango normal: 36.1°C - 37.2°C</div>
          </div>

          <div className="rounded-lg border bg-card p-3">
            <div className="text-xs text-muted-foreground">Última medición</div>
            <div className="mt-1 text-sm font-medium">Hoy, 10:30 AM</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
