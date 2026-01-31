"use client"

import { useState, useMemo } from "react"
import { filterDataByRange, type HistoricalDataPoint } from "../../features/medical-dashboard/DashboardApp"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bar,
  BarChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

type TimeRange = "7D" | "1M" | "3M" | "1Y" | "PM"

type WeightDataPoint = {
  time: string
  weight: number
  ts?: number
  firestoreTimestamp?: number
  simulatedDate?: string
}

interface WeightChartProps {
  historicalData: HistoricalDataPoint[]
  isLoadingHistory?: boolean
}

// Formatea fecha YYYY-MM-DD a nombre de día de la semana
const formatDayOfWeek = (dateStr: string): string => {
  const date = new Date(dateStr + "T00:00:00")
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
  return days[date.getDay()]
}

// Agrupa datos por mes y calcula promedio (solo valores > 0)
const groupByMonth = (data: HistoricalDataPoint[]): WeightDataPoint[] => {
  const monthMap = new Map<string, { sum: number; count: number }>()

  data.forEach((point) => {
    // Filtrar valores 0 para no diluir el promedio
    if (point.weight <= 0) return

    const date = new Date(point.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { sum: 0, count: 0 })
    }
    const entry = monthMap.get(monthKey)!
    entry.sum += point.weight
    entry.count += 1
  })

  return Array.from(monthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => {
      const [year, month] = key.split("-")
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
      return {
        time: monthNames[parseInt(month) - 1],
        weight: Math.round((value.sum / value.count) * 10) / 10, // Redondear a 1 decimal
      }
    })
}

export function WeightChartNew({ historicalData, isLoadingHistory = false }: WeightChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7D")
  const [pmYear, setPmYear] = useState("2026")

  // Procesar datos según el rango seleccionado
  const data = useMemo<WeightDataPoint[]>(() => {
    if (historicalData.length === 0) return []

    // Para PM (promedio mensual), filtrar por año y agrupar por mes
    if (timeRange === "PM") {
      const yearData = historicalData.filter((point) => {
        const year = new Date(point.date).getFullYear()
        return year === parseInt(pmYear)
      })
      return groupByMonth(yearData)
    }

    // Para otros rangos, filtrar y transformar
    const filtered = filterDataByRange(historicalData, timeRange)

    if (timeRange === "7D") {
      // 7D: Mostrar día de la semana
      return filtered
        .filter((point) => point.weight > 0) // ✅ Eliminar puntos con valor 0
        .map((point) => ({
          time: formatDayOfWeek(point.date),
          weight: point.weight,
          simulatedDate: point.date,
          firestoreTimestamp: point.timestampWeight,
        }))
    }

    if (timeRange === "1M") {
      // 1M: Mostrar cada 2 días, mostrar fechas reales (Mes día)
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
      const filteredNonZero = filtered.filter((point) => point.weight > 0) // ✅ Eliminar puntos con valor 0
      const totalPoints = filteredNonZero.length
      const labelsToShow = 4 // Mostrar 4 etiquetas distribuidas
      const labelIndices = new Set<number>()

      // Calcular índices para las 4 etiquetas distribuidas uniformemente
      for (let i = 0; i < labelsToShow; i++) {
        const index = Math.floor((i * totalPoints) / labelsToShow)
        labelIndices.add(index)
      }

      return filteredNonZero.map((point, index) => {
        const date = new Date(point.date)
        const day = date.getDate()
        const month = date.getMonth()
        const labelText = labelIndices.has(index) ? `${monthNames[month]} ${day}` : ""

        return {
          time: labelText,
          weight: point.weight,
          ts: new Date(point.date).getTime(),
          simulatedDate: point.date,
          firestoreTimestamp: point.timestampWeight,
        }
      })
    }

    if (timeRange === "3M") {
      // 3M: Mostrar 6 etiquetas distribuidas uniformemente según fechas reales
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
      const filteredNonZero = filtered.filter((point) => point.weight > 0) // ✅ Eliminar puntos con valor 0
      const totalPoints = filteredNonZero.length
      const labelsToShow = 6
      const labelIndices = new Set<number>()

      // Calcular índices para las 6 etiquetas distribuidas uniformemente
      for (let i = 0; i < labelsToShow; i++) {
        const index = Math.floor((i * totalPoints) / labelsToShow)
        labelIndices.add(index)
      }

      return filteredNonZero.map((point, index) => {
        const date = new Date(point.date)
        const day = date.getDate()
        const month = date.getMonth()

        // Mostrar etiqueta solo en los índices calculados
        const labelText = labelIndices.has(index) ? `${monthNames[month]} ${day}` : ""

        return {
          time: labelText,
          weight: point.weight,
          ts: new Date(point.date).getTime(),
          simulatedDate: point.date,
          firestoreTimestamp: point.timestampWeight,
        }
      })
    }

    if (timeRange === "1Y") {
      // 1Y: Mostrar una etiqueta por mes, sin duplicados, autoajustable
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
      const filteredNonZero = filtered.filter((point) => point.weight > 0)
      const seenMonths = new Set<string>()

      return filteredNonZero.map((point) => {
        const date = new Date(point.date)
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`
        const monthLabel = monthNames[date.getMonth()]

        let labelText = ""
        if (!seenMonths.has(monthKey)) {
          labelText = monthLabel
          seenMonths.add(monthKey)
        }

        return {
          time: labelText,
          weight: point.weight,
          ts: new Date(point.date).getTime(),
          simulatedDate: point.date,
          firestoreTimestamp: point.timestampWeight,
        }
      })
    }

    return []
  }, [historicalData, timeRange, pmYear])

  const isPM = timeRange === "PM"

  const getFixedTicks = (): number[] | undefined => {
    if (timeRange === "1M" || timeRange === "3M" || timeRange === "1Y") {
      return data.filter((d) => d.time !== "" && d.ts !== undefined).map((d) => d.ts!)
    }
    return undefined
  }

  const formatTick = (ts: number) => {
    const item = data.find((d) => d.ts === ts)
    return item?.time || ""
  }

  const formatSimulatedDate = (dateStr: string) => {
    if (!dateStr) return ""
    const [year, month, day] = dateStr.split('-')
    const shortYear = year.slice(-2)
    return `${day}/${month}/${shortYear}`
  }

  const formatFirestoreTime = (timestamp: number) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    let hours = date.getHours()
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    const ampm = hours >= 12 ? 'pm' : 'am'
    hours = hours % 12
    hours = hours ? hours : 12
    const formattedHours = String(hours).padStart(2, '0')
    return `${formattedHours}:${minutes}:${seconds} ${ampm}`
  }

  const useTimeSeries = timeRange === "1M" || timeRange === "3M" || timeRange === "1Y"

  // Mostrar mensaje de carga
  if (isLoadingHistory) {
    return (
      <Card
        className="h-[400px]"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
      >
        <CardHeader>
          <CardTitle className="text-sm font-semibold" style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
            Peso — Histórico
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[310px] flex items-center justify-center">
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Cargando datos históricos...</p>
        </CardContent>
      </Card>
    )
  }

  // Mostrar mensaje cuando no hay datos
  if (data.length === 0) {
    return (
      <Card
        className="h-[400px]"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          padding: '0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
      >
        <CardHeader className="pb-3" style={{ padding: '20px 24px 12px 24px' }}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-sm font-semibold" style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
              Peso — Histórico
            </CardTitle>
            <div className="flex items-center gap-2">
              <Tabs value={timeRange} onValueChange={(v: string) => setTimeRange(v as TimeRange)}>
                <TabsList className="h-8">
                  <TabsTrigger value="7D" className="text-xs px-2">7D</TabsTrigger>
                  <TabsTrigger value="1M" className="text-xs px-2">1M</TabsTrigger>
                  <TabsTrigger value="3M" className="text-xs px-2">3M</TabsTrigger>
                  <TabsTrigger value="1Y" className="text-xs px-2">1Y</TabsTrigger>
                  <TabsTrigger value="PM" className="text-xs px-2">PM</TabsTrigger>
                </TabsList>
              </Tabs>
              {timeRange === "PM" && (
                <Select value={pmYear} onValueChange={setPmYear}>
                  <SelectTrigger className="h-8 w-[90px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2027">2027</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[310px] flex items-center justify-center">
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            No hay datos disponibles para este rango. Los datos aparecerán conforme se generen mediciones.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className="h-[400px]"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      <CardHeader
        className="pb-3"
        style={{
          padding: '20px 24px 12px 24px'
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm font-semibold" style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Peso — Histórico</CardTitle>

          <div className="flex items-center gap-2">
            <Tabs value={timeRange} onValueChange={(v: string) => setTimeRange(v as TimeRange)}>
              <TabsList className="h-8">
                <TabsTrigger value="7D" className="text-xs px-2">
                  7D
                </TabsTrigger>
                <TabsTrigger value="1M" className="text-xs px-2">
                  1M
                </TabsTrigger>
                <TabsTrigger value="3M" className="text-xs px-2">
                  3M
                </TabsTrigger>
                <TabsTrigger value="1Y" className="text-xs px-2">
                  1Y
                </TabsTrigger>
                <TabsTrigger value="PM" className="text-xs px-2">
                  PM
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {timeRange === "PM" && (
              <Select value={pmYear} onValueChange={setPmYear}>
                <SelectTrigger className="h-8 w-[90px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2027">2027</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[310px] p-4 pt-0">
        <ResponsiveContainer width="100%" height="100%">
          {isPM ? (
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis domain={[60, 80]} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div
                        style={{
                          backgroundColor: 'hsl(0, 0%, 100%)',
                          border: '1px solid hsl(214.3, 31.8%, 91.4%)',
                          borderRadius: '8px',
                          padding: '12px',
                          fontSize: '12px',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
                        }}
                      >
                        <p style={{ fontWeight: 600, marginBottom: '4px', color: 'hsl(222.2, 84%, 4.9%)' }}>
                          {data.time} — Promedio
                        </p>
                        <p style={{ color: '#f59e0b' }}>
                          Peso: <strong>{data.weight} kg</strong>
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="weight" fill="hsl(40, 70%, 50%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(40, 70%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(40, 70%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              {useTimeSeries ? (
                <XAxis
                  type="number"
                  dataKey="ts"
                  scale="time"
                  domain={["dataMin", "dataMax"]}
                  ticks={getFixedTicks()}
                  tickFormatter={formatTick}
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted-foreground)"
                />
              ) : (
                <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              )}
              <YAxis domain={[60, 80]} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip
                cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                isAnimationActive={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div
                        style={{
                          backgroundColor: 'hsl(0, 0%, 100%)',
                          border: '1px solid hsl(214.3, 31.8%, 91.4%)',
                          borderRadius: '8px',
                          padding: '12px',
                          fontSize: '12px',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
                        }}
                      >
                        <p style={{ fontWeight: 600, marginBottom: '0px', color: 'hsl(222.2, 84%, 4.9%)' }}>
                          {data.simulatedDate ? formatSimulatedDate(data.simulatedDate) : data.time}
                        </p>
                        {data.firestoreTimestamp && (
                          <p style={{ fontWeight: 600, marginBottom: '4px', color: 'hsl(222.2, 84%, 4.9%)' }}>
                            {formatFirestoreTime(data.firestoreTimestamp)}
                          </p>
                        )}
                        <p style={{ color: '#f59e0b' }}>
                          Peso: <strong>{data.weight} kg</strong>
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="hsl(40, 70%, 50%)"
                strokeWidth={2}
                fill="url(#weightGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
