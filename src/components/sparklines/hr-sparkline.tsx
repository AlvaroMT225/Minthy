import { Line, LineChart, ResponsiveContainer } from "recharts"

const data24h = [
  { value: 68 },
  { value: 72 },
  { value: 70 },
  { value: 75 },
  { value: 73 },
  { value: 71 },
  { value: 69 },
  { value: 67 },
]

export function HRSparkline() {
  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data24h}>
          <Line type="monotone" dataKey="value" stroke="hsl(var(--destructive))" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
