"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"

export function OximeterCard() {
  const spo2 = 98
  const isNormal = spo2 >= 95

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-chart-3/10 p-2">
            <Activity className="h-5 w-5 text-chart-3" />
          </div>
          <div>
            <CardTitle>Oxímetro</CardTitle>
            <CardDescription>Saturación de oxígeno</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-bold text-chart-3">{spo2}</div>
              <div className="text-2xl text-muted-foreground">% SpO2</div>
            </div>
          </div>

          <div className={`rounded-lg p-4 text-center ${isNormal ? "bg-success/10" : "bg-destructive/10"}`}>
            <div className={`text-sm font-medium ${isNormal ? "text-success" : "text-destructive"}`}>
              {isNormal ? "✓ Nivel Normal" : "⚠ Nivel Bajo"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Nivel óptimo: ≥95%</div>
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
