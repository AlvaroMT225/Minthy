import React from "react"
import { Badge } from "../../components/ui/badge"
import { Heart, Thermometer, Wind, Activity, Weight } from "lucide-react"
import { BPChartNew } from "../../components/charts/bp-chart-new"
import { WeightChartNew } from "../../components/charts/weight-chart-new"
import { HRChart } from "../../components/charts/hr-chart"
import { SpO2Chart } from "../../components/charts/spo2-chart"
import type { HistoricalDataPoint } from "./DashboardApp"

type DashboardVariantAProps = {
  vitals: {
    heartRate: number
    systolic: number
    diastolic: number
    spo2: number
    temperature: number
    weight: number
    bmi: number
  }
  lastVitals: {
    heartRate: number
    systolic: number
    diastolic: number
    spo2: number
    temperature: number
  }
  historicalData: HistoricalDataPoint[]
  isLoadingHistory?: boolean
}

export const DashboardVariantA: React.FC<DashboardVariantAProps> = ({
  vitals,
  lastVitals,
  historicalData,
  isLoadingHistory = false,
}) => {
  return (
    <div className="space-y-6">
      {/* TARJETAS PRINCIPALES */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Frecuencia Cardíaca */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-red-500" />
              <span className="text-xs font-semibold text-red-500">
                FRECUENCIA
              </span>
            </div>
            <Badge
              variant="outline"
              className="border-green-600 bg-green-50 text-green-700 text-xs"
            >
              Normal
            </Badge>
          </div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-3xl font-bold tracking-tight text-red-500">
              {vitals.heartRate}
            </span>
            <span className="text-xs text-muted-foreground">BPM</span>
          </div>
          <span className="text-[12px] text-muted-foreground">
            Última: {lastVitals.heartRate} BPM
          </span>
        </div>

        {/* Presión Arterial */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-semibold text-blue-500">
                PRESIÓN
              </span>
            </div>
            <Badge
              variant="outline"
              className="border-green-600 bg-green-50 text-green-700 text-xs"
            >
              Normal
            </Badge>
          </div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-2xl font-bold tracking-tight text-blue-500">
              {vitals.systolic}
            </span>
            <span className="text-xl font-bold text-blue-500">/</span>
            <span className="text-2xl font-bold tracking-tight text-blue-500">
              {vitals.diastolic}
            </span>
          </div>
          <span className="text-[12px] text-muted-foreground">
            Última: {lastVitals.systolic}/{lastVitals.diastolic} mmHg
          </span>
        </div>

        {/* Saturación O₂ */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-green-500" />
              <span className="text-xs font-semibold text-green-500">
                SpO₂
              </span>
            </div>
            <Badge
              variant="outline"
              className="border-green-600 bg-green-50 text-green-700 text-xs"
            >
              Normal
            </Badge>
          </div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-3xl font-bold tracking-tight text-green-500">
              {vitals.spo2}
            </span>
            <span className="text-xs text-muted-foreground">%</span>
          </div>
          <span className="text-[12px] text-muted-foreground">
            Última: {lastVitals.spo2} %
          </span>
        </div>

        {/* Temperatura */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-semibold text-purple-500">
                TEMPERATURA
              </span>
            </div>
            <Badge
              variant="outline"
              className="border-green-600 bg-green-50 text-green-700 text-xs"
            >
              Normal
            </Badge>
          </div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-3xl font-bold tracking-tight text-purple-500">
              {vitals.temperature}
            </span>
            <span className="text-xs text-muted-foreground">°C</span>
          </div>
          <span className="text-[12px] text-muted-foreground">
            Última: {lastVitals.temperature} °C
          </span>
        </div>

        {/* Peso / IMC */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Weight className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-semibold text-amber-500">
                PESO / IMC
              </span>
            </div>
            <Badge
              variant="outline"
              className="border-green-600 bg-green-50 text-green-700 text-xs"
            >
              Normal
            </Badge>
          </div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-2xl font-bold tracking-tight text-amber-500">
              {vitals.weight}
            </span>
            <span className="text-xs text-muted-foreground">kg</span>
          </div>
          <span className="text-xs text-muted-foreground">
            IMC: {vitals.bmi}
          </span>
        </div>
      </div>

      {/* GRÁFICAS PRINCIPALES */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <HRChart historicalData={historicalData} isLoadingHistory={isLoadingHistory} />
        <BPChartNew historicalData={historicalData} isLoadingHistory={isLoadingHistory} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SpO2Chart historicalData={historicalData} isLoadingHistory={isLoadingHistory} />
        <WeightChartNew historicalData={historicalData} isLoadingHistory={isLoadingHistory} />
      </div>
    </div>
  )
}
