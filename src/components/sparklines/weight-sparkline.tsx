"use client"

import { Line, LineChart, ResponsiveContainer } from "recharts"

const data = [
  { value: 71.2 },
  { value: 71.0 },
  { value: 70.8 },
  { value: 70.9 },
  { value: 70.7 },
  { value: 70.6 },
  { value: 70.5 },
]

export function WeightSparkline() {
  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke="var(--weight-amber)" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
