"use client"

import { Line, LineChart, ResponsiveContainer } from "recharts"

const data24h = [
  { value: 118 },
  { value: 120 },
  { value: 119 },
  { value: 122 },
  { value: 121 },
  { value: 120 },
  { value: 119 },
  { value: 120 },
]

export function BPSparkline() {
  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data24h}>
          <Line type="monotone" dataKey="value" stroke="var(--bp-blue)" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
