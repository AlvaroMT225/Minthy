"use client"

import { Line, LineChart, ResponsiveContainer } from "recharts"

const data = [{ value: 92 }, { value: 95 }, { value: 98 }, { value: 94 }, { value: 96 }, { value: 93 }, { value: 95 }]

export function GlucoseSparkline() {
  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke="var(--glucose-red)" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
