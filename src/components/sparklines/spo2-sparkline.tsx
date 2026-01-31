"use client"

import { Line, LineChart, ResponsiveContainer } from "recharts"

const data = [{ value: 97 }, { value: 98 }, { value: 98 }, { value: 97 }, { value: 98 }, { value: 99 }, { value: 98 }]

export function SpO2Sparkline() {
  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke="var(--spo2-green)" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
