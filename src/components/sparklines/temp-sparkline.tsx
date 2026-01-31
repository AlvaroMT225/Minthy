"use client"

import { Line, LineChart, ResponsiveContainer } from "recharts"

const data = [{ value: 36.4 }, { value: 36.5 }, { value: 36.6 }, { value: 36.5 }, { value: 36.4 }, { value: 36.5 }]

export function TempSparkline() {
  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke="var(--temp-violet)" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
